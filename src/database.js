import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongoServer = new MongoMemoryServer()

mongoose.Promise = Promise

async function initDatabase() {
  const uri = await mongoServer.getUri()

  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }

  mongoose.connect(uri, options)

  const db = mongoose.connection

  db.on('error', (error) => {
    console.error(error)
    if (error.message.code === 'ETIMEDOUT') {
      console.log('connection timed out, retrying...')
      mongoose.connect(uri, options)
    }
  })

  db.once('open', () => {
    console.log(`MongoDB successfully connected to ${uri}`)
  })
}

initDatabase()
