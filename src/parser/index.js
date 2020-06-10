import stream from './stream'
import parser from './parser'

export const JHU_CSEE_US_TIME_SERIES_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'

export const JHU_CSEE_FIPS_LOOKUP_URL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv'

export default async function (url) {
  try {
    const httpStream = await stream(url)
    return parser(httpStream)
  } catch (error) {
    console.error(error)
  }
}
