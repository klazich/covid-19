import mongoose from 'mongoose'

import Entry from './models/entry'
import Metadata from './models/metadata'

mongoose.Promise = Promise

export const models = { Entry, Metadata }
export { bulkInsertJHUData } from './populate'

export async function startDatabase(options = {}) {
  const uri =
    process.env.PRODUCTION_DB_URL ?? 'mongodb://localhost:27017/covid-19'

  try {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      ...options,
    })

    console.log(`Successfully connected to MongoDB server`)
  } catch (error) {
    console.log('Failed to connect to MongoDB server')
    console.error(error)
  }
}

export async function closeDatabase(force = false) {
  try {
    await mongoose.connection.close(force)
    console.log('Successfully closed connection to MongoDB server')
  } catch (error) {
    console.log('Failed to close connection to MongoDB server')
    console.error(error)
  }
}

export async function dropDatabase() {
  try {
    await mongoose.connection.dropDatabase()
    console.log(`Successfully dropped database: ${mongoose.connection.name}`)
  } catch (error) {
    console.log(`Failed to drop database: ${mongoose.connection.name}`)
    console.error(error)
  }
}
