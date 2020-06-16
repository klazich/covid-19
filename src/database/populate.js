import { parser } from '../parser'
import Entry from './models/entry'
import startDatabase, { dropDatabase, closeDatabase } from './index'

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
const isDate = (str) => /\d?\d\/\d\d\/\d\d/.test(str)
const parseDate = (str) =>
  str.split(/\//g).map((v, i) => parseInt(i === 2 ? `20${v}` : v, 10))

async function cleanData() {
  const populationMap = await fetchPopulationStats()

  return function* (obj) {
    const doc = cleanKeys(obj)
    doc.population = populationMap.get(doc.uid)

    for (const key in doc) if (doc[key] === '') delete doc[key]

    for (const key in obj) {
      if (isDate(key)) {
        const [month, day, year] = parseDate(key)

        yield {
          ...doc,
          date: new Date(year, month - 1, day), // Month is 0 indexed
          confirmed: obj[key],
        }
      }
    }
  }
}

async function loadEntries(limit = Infinity) {
  const url = process.env.JHU_TIME_SERIES_DATA_URL
  const cleanup = await cleanData()

  const docs = []

  for await (const data of await parser(url)) {
    docs.push(...cleanup(data))
    if (docs.length > limit) break
  }

  await dropDatabase()

  try {
    await Entry.insertMany(docs)
  } catch (error) {
    console.error('Could not insert documents')
    console.error(error)
  }
}

const main = async () => {
  await startDatabase()
  await loadEntries(5000)
  const test = await Entry.findOne()
  console.log(test)
  console.log(test.loc)
  await closeDatabase()
}

main()
