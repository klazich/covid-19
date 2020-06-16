import { parser } from '../parser'
import Entry from './models/entry'
import initDatabase, { dropDatabase, closeDatabase } from './index'

export const JHU_CSEE_US_TIME_SERIES_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'

export const JHU_CSEE_FIPS_LOOKUP_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv'

async function fetchPopulationStats() {
  const url = JHU_CSEE_FIPS_LOOKUP_URL
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

    for (const key in doc) {
    }

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

// const entrySchema = new Schema({
//   uid            : Number,
//   country_iso2   : String,
//   country_iso3   : String,
//   country_code   : Number,
//   fips           : Number,
//   county         : String,
//   state          : String,
//   country        : String,
//   combined_name  : String,
//   population     : Number,
//   loc: {
//     type: { type: String },
//     coordinates: [Number],
//   },
//   date: Date,
//   confirmed: Number,
// })

async function loadEntries(limit = Infinity) {
  const url = JHU_CSEE_US_TIME_SERIES_URL
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
  await initDatabase()
  await loadEntries(5000)
  const test = await Entry.findOne()
  console.log(test)
  console.log(test.loc)
  await closeDatabase()
}

main()
