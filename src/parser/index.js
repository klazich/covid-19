import httpStream from './stream'
import csvParser from './parser'

export const JHU_CSEE_US_TIME_SERIES_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'

export const JHU_CSEE_FIPS_LOOKUP_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv'

export async function parser(url) {
  try {
    const stream = await httpStream(url)
    return csvParser(stream)
  } catch (error) {
    console.error(error)
  }
}

export async function getPopulationMap(url = JHU_CSEE_FIPS_LOOKUP_URL) {
  const map = new Map()
  const countryCodes = new Set(['16', '316', '580', '630', '840', '850'])
  for await (const data of await parser(url)) {
    if (countryCodes.has(data.code3)) {
      const { UID, Population } = data
      map.set(UID, Number(Population))
    }
  }
  return map
}

export async function* getCovid19Data(url = JHU_CSEE_US_TIME_SERIES_URL) {
  for await (const data of await parser(url)) {
    yield data
  }
}
