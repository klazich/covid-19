import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongoServer = new MongoMemoryServer()

mongoose.Promise = Promise

async function getDatabaseUri() {
  const uri = await mongoServer.getUri()
  return uri
}

export async function initDatabase() {
  const uri = await getDatabaseUri()

  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }

  try {
    await mongoose.connect(uri, options)
  } catch (error) {
    console.error('Could not connect to database', error)
  }

  mongoose.connection.on('error', (error) => {
    console.error('Database connection error', error)
  })

  mongoose.connection.once('open', () => {
    console.log(`Successfully connected to ${uri}`)
  })
}
