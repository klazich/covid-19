import argv from 'minimist'

import {
  startDatabase,
  bulkInsertJHUData,
  closeDatabase,
  dropDatabase,
} from './database'
import { startServer } from './server'

const args = argv(process.argv.slice(2))

// const doPopulate = args.populate > 0
// const populateCount = Number.isInteger(args.populate) ?? args.populate

console.log(args)

async function start() {
  await startDatabase()

  if (args.populate) {
    await dropDatabase()

    const populateCount = Number.isInteger(args.populate)
      ? args.populate
      : Infinity

    await bulkInsertJHUData(populateCount)
  }

  const server = await startServer()

  process.on('SIGINT', async () => {
    server.close(async (err) => {
      if (err) {
        console.log('Could not close GraphQL server')
        console.error(err)
      } else {
        console.log('Successfully closed GraphQL server')
      }
      await closeDatabase()
    })
  })
}

start()
