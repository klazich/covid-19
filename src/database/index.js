import mongoose from 'mongoose'

mongoose.Promise = Promise

const getDatabaseUri = () =>
  process.env.NODE_ENV === 'development'
    ? process.env.DEVELOPMENT_DB_URL
    : process.env.PRODUCTION_DB_URL

export async function startDatabase() {
  const uri = getDatabaseUri()

  console.log(process.env.NODE_ENV, uri)

  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }

  try {
    await mongoose.connect(uri, options)
    console.log(`Successfully connected to MongoDB server`)
    console.log(`  URI: ${uri}`)
    console.log(`  DATABASE: ${mongoose.connection.name}`)
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
