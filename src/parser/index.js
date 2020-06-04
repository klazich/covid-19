import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import Papa from 'papaparse'

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
export default parseRemoteCSV
