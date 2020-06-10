import Papa from 'papaparse'

export default async function* parser(stream) {
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
