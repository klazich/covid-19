import httpStream from './stream'
import csvParser from './parser'

async function createHttpStream(url) {
  // Request object for axios
  const request = {
    url,
    responseType: 'stream',
    adapter: httpAdapter,
  }

  try {
    const stream = await httpStream(url)
    return csvParser(stream)
  } catch (error) {
    console.error(error)
  }
}
export default parseRemoteCSV
