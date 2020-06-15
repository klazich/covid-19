import httpStream from './stream'
import csvParser from './parser'

export async function parser(url) {
  try {
    const stream = await httpStream(url)
    return csvParser(stream)
  } catch (error) {
    console.error(error)
  }
}
