import mongoose from 'mongoose'
// import { MongoMemoryServer } from 'mongodb-memory-server'

// const mongoMemoryServer = new MongoMemoryServer()

mongoose.Promise = Promise

const getDatabaseUrl = () =>
  process.env.NODE_ENV === 'development'
    ? process.env.DEVELOPMENT_DB_URL
    : process.env.PRODUCTION_DB_URL

export default async function startDatabase() {
  const url = getDatabaseUrl()

  console.log(process.env.NODE_ENV, url)

  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }

  try {
    await mongoose.connect(url, options)
  } catch (error) {
    console.error('Could not connect to database')
    console.error(error)
  }

  const db = mongoose.connection
  db.on('error', (error) => {
    console.error('Database connection error', error)
  })
  db.once('open', () => {
    console.log(`Successfully connected to MongoDB at ${url}`)
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
