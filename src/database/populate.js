import { remoteCsvParser } from '../parser'
import Entry from './models/entry'
import Metadata from './models/metadata'

async function fetchJHUPopulationStats() {
  const url = process.env.JHU_FIPS_LOOKUP_URL
  const countryCodes = new Set(['16', '316', '580', '630', '840', '850'])

  const map = new Map()

  for await (const data of await remoteCsvParser(url)) {
    if (countryCodes.has(data.code3)) {
      const { UID, Population } = data
      map.set(UID, Number(Population))
    }
  }

  return map
}

const isDate = (str) => /\d?\d\/\d\d\/\d\d/.test(str)
const parseDate = (str) =>
  str.split(/\//g).map((v, i) => parseInt(i === 2 ? `20${v}` : v, 10))

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
  const populationMap = await fetchJHUPopulationStats()

  return function* (obj) {
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

async function* streamJHUData() {
  const url = process.env.JHU_TIME_SERIES_DATA_URL
  const clean = await cleanJHUData()

  for await (const obj of await remoteCsvParser(url)) {
    yield* clean(obj)
  }
}

export async function bulkInsertJHUData() {
  let bulk = Entry.collection.initializeUnorderedBulkOp()

  // For metadata collection
  const states = new Set()
  const counties = new Set()
  const uids = new Set()
  let firstDate = null
  let lastDate = null

  for await (const doc of streamJHUData()) {
    if (doc.state) states.add(doc.state)
    if (doc.county) counties.add(doc.county)
    uids.add(doc.uid)
    if (firstDate === null) firstDate = doc.date
    lastDate = doc.date

    bulk.insert(doc) // Insert new document
  }

  try {
    console.log(`Inserting ${bulk.length} new documents...`)
    await bulk.execute() // Execute the bulk insert op
    console.log('...done')
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
    console.log('...done')
  } catch (error) {
    console.log('Could not create the metadata document')
  }
}
