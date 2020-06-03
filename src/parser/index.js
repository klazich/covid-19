import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import Papa from 'papaparse'

// MongoDB Bulk API stream with mongoose...
// https://stackoverflow.com/questions/25054958/save-a-very-big-csv-to-mongodb-using-mongoose
// and...
// https://stackoverflow.com/questions/37347228/mongodb-mongoose-and-node-js-update-stream

const NYT_DATA_URL =
  'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv'

const JHU_CSEE_US_TIME_SERIES_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'

const JHU_CSEE_FIPS_LOOKUP_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv'

async function createHttpStream(url) {
  // Request object for axios
  const request = {
    url,
    responseType: 'stream',
    adapter: httpAdapter,
  }

  try {
    const response = await axios(request)
    return response.data
  } catch (error) {
    const { stack } = error.toJSON()
    console.error(stack ? stack : error)
  }
}

async function* parseRemoteCSV(url) {
  // Parse readable stream instead of file
  // See: https://github.com/mholt/PapaParse#papa-parse-for-node
  const csvParserStream = Papa.parse(Papa.NODE_STREAM_INPUT, { header: true })

  try {
    const httpStream = await createHttpStream(url)
    // Pipe the http stream to the csv parser
    httpStream.pipe(csvParserStream)
  } catch (error) {
    console.error(error)
  }

  // Yield parsed csv data row by row
  for await (const record of csvParserStream) {
    yield record
  }
}

async function* transform(readable, propMapFn = (obj) => obj) {}

// {
// 	"_id" : ObjectId("5e8cd51800c98085a07ce9e1"),
// 	"uid" : 84036115,
// 	"country_iso2" : "US",
// 	"country_iso3" : "USA",
// 	"country_code" : 840,
// 	"fips" : 36115,
// 	"county" : "Washington",
// 	"state" : "New York",
// 	"cuntry" : "US",
// 	"combined_name" : "Washington, New York, US",
// 	"population" : 61204,
// 	"loc" : {
// 		"type" : "Point",
// 		"coordinates" : [
// 			-73.4304,
// 			43.3115
// 		]
// 	},
// 	"date" : ISODate("2020-04-06T00:00:00Z"),
// 	"confirmed" : 19,
// 	"deaths" : 1
// }

async function main() {
  try {
    for await (const record of parseRemoteCSV(JHU_CSEE_US_TIME_SERIES_URL)) {
      if (record.UID === '84036115') console.log(record)
    }
  } catch (error) {
    console.error(error)
  }
}

main()
