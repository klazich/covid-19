import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import Papa from 'papaparse'

const NYT_DATA_URL =
  'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv'

const JHU_DATA_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'

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
    console.error(error.toJSON().stack)
  }
}

async function* csvParser(url) {
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

async function main() {
  try {
    for await (const record of csvParser(JHU_DATA_URL)) {
      console.log(record)
    }
  } catch (error) {
    console.error(error)
  }
}

main()
