import { remoteCsvParser } from '../parser'
import Entry from './models/entry'
import Metadata from './models/metadata'

async function fetchJHUPopulationMap() {
  const url = process.env.JHU_FIPS_LOOKUP_URL
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

const isDate = (str) => /\d?\d\/\d\d\/\d\d/.test(str)
const parseDate = (str) =>
  str.split(/\//g).map((v, i) => parseInt(i === 2 ? `20${v}` : v, 10))

// Map the original keys to there mongo schema equivalent
const cleanKeys = (obj) => ({
  uid: obj.UID,
  country_iso2: obj.iso2,
  country_iso3: obj.iso3,
  country_code: obj.code3,
  fips: obj.FIPS,
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
          confirmed: obj[key],
        }
      }
    }
  }
}

async function* iterJHUData() {
  const url = process.env.JHU_TIME_SERIES_DATA_URL
  const clean = await cleanJHUData()

  for await (const obj of await remoteCsvParser(url)) {
    yield* clean(obj) // Pass obj and execution to the clean generator
  }
}

export async function bulkInsertJHUData(limit = Infinity) {
  let bulk = Entry.collection.initializeUnorderedBulkOp()

  // Variables for the metadata collection
  const states = new Set()
  const counties = new Set()
  const uids = new Set()
  let firstDate = null
  let lastDate = null

  for await (const doc of iterJHUData()) {
    if (bulk.length >= limit) break

    if (doc.state) states.add(doc.state)
    if (doc.county) counties.add(doc.county)
    uids.add(doc.uid)
    if (firstDate === null) firstDate = doc.date
    lastDate = doc.date

    bulk.insert(doc) // Insert new document for bulk insert op
  }

  try {
    console.log(`Inserting ${bulk.length} new documents...`)
    await bulk.execute() // Execute the bulk insert op
  } catch (error) {
    console.log('Could not insert new documents')
    console.error(error)
  }

  try {
    console.log('Creating the metadata document...')
    await Metadata.create({
      states: [...states].sort(),
      counties: [...counties].sort(),
      uids: [...uids],
      first_date: firstDate,
      last_date: lastDate,
    })
  } catch (error) {
    console.log('Could not create the metadata document')
    console.error(error)
  }
}
