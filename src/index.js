import startServer from './server'
import startDatabase from './database'

async function start() {
  await startDatabase()
  await startServer()
}

start()
