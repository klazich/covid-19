import { get } from 'https'

const URL =
  'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv'

const fetch = (url) =>
  new Promise((resolve, reject) => {
    const request = get(url, async (response) => {
      // handle https errors
      if (response.statusCode >= 400) {
        const msg = `HTTP Status: ${response.statusCode} ${response.statusMessage}`
        reject(new Error(msg))
      }

      try {
        let body = ''
        for await (const chunk of response) {
          body += chunk
        }
        resolve(body)
      } catch (error) {
        reject(error)
      }
    })

    request.end()
  })

const main = async () => {
  try {
    const text = await fetch(URL)
    console.log(text)
  } catch (error) {
    console.error(error)
  }
}

main()
