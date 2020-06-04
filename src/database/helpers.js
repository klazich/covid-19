import parser from '../parser'
import { JHU_CSEE_FIPS_LOOKUP_URL } from '../../config'

export async function getPopulationStats() {
  const populationStats = new Map()
  for await (const record of parser(JHU_CSEE_FIPS_LOOKUP_URL)) {
    if (record.code3 === '840') {
      const { UID, Population } = record
      populationStats.set(Number(UID), Number(Population))
    }
  }
  return populationStats
}
