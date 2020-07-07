import { remoteCsvParser } from './parser'
import Entry from '../models/entry'

const JHU_FIPS_LOOKUP_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv'
const JHU_TIME_SERIES_DATA_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'

async function fetchJHUPopulationMap() {
  const url = JHU_FIPS_LOOKUP_URL

  const iterJHUPopulationData = await remoteCsvParser(url)

  // The JHU fips lookup table includes statistics for every country in the
  // world. We are only interested in US states and territories which will have
  // one of the country codes listed here
  const countryCodes = new Set(['16', '316', '580', '630', '840', '850'])
  const populationMap = new Map()

  for await (const data of iterJHUPopulationData) {
    if (countryCodes.has(data.code3)) {
      const { UID, Population } = data
      populationMap.set(UID, Number(Population))
    }
  }

  return populationMap
}

const isDate = (str) => /\d\d?\/\d\d?\/\d\d/.test(str)
const parseDate = (str) =>
  str.split(/\//g).map((v, i) => parseInt(i === 2 ? `20${v}` : v, 10))

// Map the original keys to there mongodb schema equivalent
const cleanKeys = (obj) => ({
  uid: Number(obj.UID),
  country_iso2: obj.iso2,
  country_iso3: obj.iso3,
  country_code: Number(obj.code3),
  fips: Number(obj.FIPS),
  county: obj.Admin2,
  state: obj.Province_State,
  country: obj.Country_Region,
  combined_name: obj.Combined_Key,
  loc: {
    type: 'Point',
    coordinates: [Number(obj.Long_), Number(obj.Lat)],
  },
})

async function cleanJHUData() {
  const populationMap = await fetchJHUPopulationMap()

  return function* iterCleaned(obj) {
    const cleaned = cleanKeys(obj)
    cleaned.population = populationMap.get(cleaned.uid) // Add population stats to obj

    for (const key in cleaned) if (cleaned[key] === '') delete cleaned[key]

    for (const key in obj) {
      if (isDate(key)) {
        const [month, day, year] = parseDate(key)

        yield {
          ...cleaned,
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

  for await (const obj of await remoteCsvParser(url)) {
    yield* clean(obj) // Pass obj and execution to the clean generator
  }
}

export async function bulkInsertJHUData(limit = Infinity) {
  // Use the MongoDB Bulk API for document creation
  // See: https://stackoverflow.com/questions/37379180/bulk-insert-in-mongodb-using-mongoose/37379532
  let bulk = Entry.collection.initializeUnorderedBulkOp()

  for await (const doc of iterJHUData()) {
    if (bulk.length >= limit) break

    bulk.insert(doc) // Insert new document for bulk insert op
  }

  try {
    console.log(`Inserting ${bulk.length} new documents...`)
    await bulk.execute() // Execute the bulk insert op
  } catch (error) {
    console.log('Could not insert new documents')
    console.error(error)
  }
}
