import { remoteCsvParserStream } from './parser'
import { models } from '../models'

const { Entry } = models

const JHU_FIPS_LOOKUP_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv'
const JHU_TIME_SERIES_DATA_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'

async function fetchJHUPopulationMap() {
  const url = JHU_FIPS_LOOKUP_URL

  const iterJHUPopulationData = await remoteCsvParserStream(url)

  // The JHU fips lookup table includes statistics for every country in the
  // world. We are only interested in US states and territories which will have
  // one of the country codes listed below.
  const countryCodes = new Set(['16', '316', '580', '630', '840', '850'])
  const populationMap = new Map()

  for await (const data of iterJHUPopulationData) {
    if (countryCodes.has(data.code3)) {
      const { UID, Population } = data
      populationMap.set(Number(UID), Number(Population))
    }
  }

  return populationMap
}

const isDate = (str) => /\d\d?\/\d\d?\/\d\d/.test(str)
const parseDate = (str) =>
  str.split(/\//g).map((v, i) => parseInt(i === 2 ? `20${v}` : v, 10))

// Map the original keys to there mongodb schema equivalent
const cleanAndTypeKeys = ({
  UID,
  iso2,
  iso3,
  code3,
  FIPS,
  Admin2,
  Province_State,
  Country_Region,
  Combined_Key,
  Long_,
  Lat,
}) => ({
  uid: Number(UID),
  country_iso2: String(iso2),
  country_iso3: String(iso3),
  country_code: Number(code3),
  fips: Number(FIPS),
  county: String(Admin2),
  state: String(Province_State),
  country: String(Country_Region),
  combined_name: String(Combined_Key),
  loc: {
    type: 'Point',
    coordinates: [Number(Long_), Number(Lat)],
  },
})

async function cleanJHUData() {
  const populationMap = await fetchJHUPopulationMap()

  return function* iterCleaned(obj) {
    const template = cleanAndTypeKeys(obj)
    template.population = populationMap.get(template.uid) // Add population stats to obj

    // Remove keys with empty values
    for (const key in template) if (template[key] === '') delete template[key]

    for (const key in obj) {
      if (isDate(key)) {
        const [month, day, year] = parseDate(key)

        yield {
          ...template,
          date: new Date(year, month - 1, day), // Month is 0 indexed
          confirmed: Number(obj[key]),
        }
      }
    }
  }
}

async function* iterJHUData() {
  const url = JHU_TIME_SERIES_DATA_URL

  const clean = await cleanJHUData()

  for await (const obj of await remoteCsvParserStream(url)) {
    yield* clean(obj) // Pass obj and execution to the clean generator
  }
}

export async function bulkInsertJHUData(limit = Infinity) {
  // Use the MongoDB Bulk API for document creation
  // See: https://stackoverflow.com/questions/37379180/bulk-insert-in-mongodb-using-mongoose/37379532
  let bulk = Entry.collection.initializeUnorderedBulkOp()

  const MAX_LENGTH = 100000 // Limit bulk inserts to 100000 documents
  let insertCount = 0

  for await (const doc of iterJHUData()) {
    bulk.insert(doc) // Insert new document for bulk insert op
    insertCount += 1

    if (insertCount >= limit) break

    if (bulk.length >= MAX_LENGTH) {
      console.log(`Inserting ${bulk.length} new documents...`)

      try {
        await bulk.execute() // Execute the bulk insert op for chunk
      } catch (err) {
        console.log('Could not insert new documents')
        console.error(err)
      } finally {
        bulk = Entry.collection.initializeUnorderedBulkOp()
      }
    }
  }

  try {
    console.log(`Inserting ${bulk.length} new documents...`)
    await bulk.execute() // Execute the bulk insert op for the rest
  } catch (err) {
    console.log('Could not insert new documents')
    console.error(err)
  }
}
