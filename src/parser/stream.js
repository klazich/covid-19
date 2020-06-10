import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'

export default async function stream(url) {
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
