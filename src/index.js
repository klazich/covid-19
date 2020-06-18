// import startServer from './server'
import { startDatabase, dropDatabase, closeDatabase } from './database'
import { bulkInsertJHUData } from './database/populate'
import Entry from './database/models/entry'
import Metadata from './database/models/metadata'

async function test() {
  await startDatabase()
  await dropDatabase()
  await bulkInsertJHUData()
  console.log(await Entry.findOne())
  console.log(await Metadata.findOne())
  await closeDatabase()
}

test()
