import stream from './stream'
import parser from './parser'

async function createHttpStream(url) {
  // Request object for axios
  const request = {
    url,
    responseType: 'stream',
    adapter: httpAdapter,
  }

  try {
    const httpStream = await stream(url)
    return parser(httpStream)
  } catch (error) {
    console.error(error)
  }
}
export default parseRemoteCSV
