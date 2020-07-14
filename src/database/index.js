import mongoose from 'mongoose'

mongoose.Promise = Promise

export async function openDatabaseConnection() {
  const url = process.env.MONGODB_URL

  console.log(url)

  try {
    await mongoose.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })

    console.log(`Successfully connected to MongoDB server`)
  } catch (error) {
    console.log('Failed to connect to MongoDB server')
    console.error(error)
  }
}

export async function closeDatabaseConnection(force = false) {
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
