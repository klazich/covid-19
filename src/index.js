import initServer from './server'
import initDatabase from './database'

async function start() {
  await initDatabase()
  await initServer()
}
