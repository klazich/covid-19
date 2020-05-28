import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import Papa from 'papaparse'

const DATA_URL =
  'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv'

async function createHttpStream(url) {
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
  const csvParserStream = Papa.parse(Papa.NODE_STREAM_INPUT, { header: true })
  csvParserStream.on('end', () => console.log('****** PARSER END ******'))

  try {
    const httpStream = await createHttpStream(url)
    // Pipe the http stream to the csv parser
    httpStream.pipe(csvParserStream)
    httpStream.on('end', () => console.log('****** HTTP END ******'))
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
    let c = 0
    for await (const record of csvParser(DATA_URL)) {
      // console.log(record)
      if (c % 10000 === 0) console.log(c)
      c += 1
    }
  } catch (error) {
    console.error(error)
  }
}

main()
