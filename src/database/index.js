import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongoMemoryServer = new MongoMemoryServer()

mongoose.Promise = Promise

async function getDatabaseUri() {
  // const uri = await mongoMemoryServer.getUri()
  const pw = '86PF0Qirpx4hT6WU'
  const db = 'covid-19'
  const uri = `mongodb+srv://admin:${pw}@cluster0-6qpn3.mongodb.net/${db}?retryWrites=true&w=majority`
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
    console.error('Could not connect to database')
    console.error(error)
  }

  mongoose.connection
    .once('open', () => {
      console.log(`Successfully connected to MongoDB at ${uri}`)
    })
    .on('error', (error) => {
      console.error('Database connection error', error)
    })
}

export async function closeDatabase(force = false) {
  try {
    await mongoose.connection.close(force)
    console.log('Connection to MongoDB closed')
  } catch (error) {
    console.error(error)
  }
}

export async function dropDatabase() {
  try {
    const dbName = mongoose.connection.name
    await mongoose.connection.dropDatabase()
    console.log(`Dropped database: ${dbName}`)
  } catch (error) {
    console.error(error)
  }
}
