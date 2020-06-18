import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import Papa from 'papaparse'

async function httpDataStream(url) {
  // The request object passed to axios
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
    console.error(stack || error)
  }
}

async function* csvParserSteam(stream) {
  // Parse readable stream instead of file
  // See: https://github.com/mholt/PapaParse#papa-parse-for-node
  const parserStream = Papa.parse(Papa.NODE_STREAM_INPUT, { header: true })

  // Pipe the given stream to the parser
  stream.pipe(parserStream)

  // Yield parsed csv data row by row
  for await (const data of parserStream) {
    yield data
  }
}

export async function remoteCsvParser(url) {
  try {
    const stream = await httpDataStream(url)
    return csvParserSteam(stream)
  } catch (error) {
    console.error(error)
  }
}
