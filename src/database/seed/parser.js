import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import Papa from 'papaparse'

async function createHttpStream(url) {
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

async function* iterCsvLinesFromStream(stream) {
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
    const stream = await createHttpStream(url)
    return iterCsvLinesFromStream(stream)
  } catch (error) {
    console.error(error)
  }
}
