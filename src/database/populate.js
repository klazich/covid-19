import { getPopulationMap, getCovid19Data } from '../parser'
import Entry from './models/entry'
import { initDatabase } from './index'

const CHUNK_LENGTH = 2000

const isDate = (str) => /\d?\d\/\d\d\/\d\d/.test(str)
const parseDate = (str) =>
  str.split(/\//g).map((v, i) => parseInt(i === 2 ? `20${v}` : v, 10))

// UID            : '84001055',
// iso2           : 'US',
// iso3           : 'USA',
// code3          : '840',
// FIPS           : '1055.0',
// Admin2         : 'Etowah',
// Province_State : 'Alabama',
// Country_Region : 'US',
// Lat            : '34.04567266',
// Long_          : '-86.04051873',
// Combined_Key   : 'Etowah, Alabama, US',

// '1/22/20': '0',
// '1/23/20': '0',
// '1/24/20': '0',

async function transformAndSplitData() {
  const populationMap = await getPopulationMap()

  return function* (obj) {
    const token = {
      uid: obj.UID,
      country_iso2: obj.iso2,
      country_iso3: obj.iso3,
      country_code: obj.code3,
      fips: obj.FIPS,
      county: obj.Admin2,
      state: obj.Province_State,
      country: obj.Country_Region,
      combined_name: obj.Combined_Key,
      population: populationMap.get(obj.UID),
      loc: {
        type: 'Point',
        coordinates: [obj.Lat, obj.Long_],
      },
    }

    for (const key in obj) {
      if (isDate(key)) {
        const [month, day, year] = parseDate(key)

        yield {
          ...token,
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

async function* objToEntries(dataIterator = getCovid19Data()) {
  const transform = await transformAndSplitData()

  for await (const obj of dataIterator) {
    yield* transform(obj)
  }
}

async function* chunkEntries(entriesIterator = objToEntries()) {
  let chunk = []
  for await (const entry of entriesIterator) {
    chunk.push(entry)
    if (chunk.length >= CHUNK_LENGTH) {
      yield chunk
      chunk = []
    }
  }
  if (chunk.length > 0) yield chunk
}

async function* loadEntries(chunkIterator = chunkEntries(), limit = Infinity) {
  let count = 0
  for await (const chunk of chunkIterator) {
    if (count > limit) break
    try {
      yield Entry.insertMany(chunk)
      count += chunk.length
    } catch (error) {
      console.error(error)
    }
  }
  console.log('all inserts started...')
}

const main = async () => {
  await initDatabase()
  for await (const insert of loadEntries()) {
    console.log(insert)
  }

  const entries = await Entry.find()
  console.log(entries)
}

main()
