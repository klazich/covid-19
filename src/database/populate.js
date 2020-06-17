import { parser } from '../parser'
import Entry from './models/entry'
import { startDatabase, dropDatabase, closeDatabase } from './index'

async function fetchPopulationStats() {
  const url = process.env.JHU_FIPS_LOOKUP_URL
  const countryCodes = new Set(['16', '316', '580', '630', '840', '850'])

  const map = new Map()

  for await (const data of await parser(url)) {
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
    coordinates: [obj.Long_, obj.Lat],
  },
})

async function cleanJHUDataObjects() {
  const populationMap = await fetchPopulationStats()

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

async function* streamJHUDataAsObjects() {
  const url = process.env.JHU_TIME_SERIES_DATA_URL
  const clean = await cleanJHUDataObjects()

  for await (const obj of await parser(url)) {
    yield* clean(obj)
  }
}

async function createManyEntires(docs) {
  try {
    console.log(`Inserting ${docs.length} new documents...`)
    await Entry.insertMany(docs)
    console.log('done')
  } catch (error) {
    console.error('Could not insert documents')
    console.error(error)
  }
}

async function loadJHUData(chunkSize = 0, limit = Infinity) {
  await dropDatabase()

  let docs = []

  for await (const doc of streamJHUDataAsObjects()) {
    docs.push(doc)

    if (chunkSize > 1 && docs.length >= chunkSize) {
      await createManyEntires(docs)
      docs = []
    }

    if (docs.length > limit) break
  }

  if (docs.length > 0) await createManyEntires(docs)
}

const main = async () => {
  await startDatabase()
  await loadJHUData(10000)
  const test = await Entry.findOne({
    combined_name: 'Washington, New York, US',
  })
  console.log(test)
  console.log(test.loc)
  await closeDatabase()
}

main()
