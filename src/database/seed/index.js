import argv from 'minimist'

import {
  openDatabaseConnection,
  closeDatabaseConnection,
  dropDatabase,
} from '../index'
import { bulkInsertJHUData } from './populate'

async function seedMongoDatabase(limit) {
  await openDatabaseConnection()
  await dropDatabase()
  await bulkInsertJHUData(limit)
  await closeDatabaseConnection()
}

const args = argv(process.argv.slice(2))

seedMongoDatabase(args.limit ?? Infinity)
