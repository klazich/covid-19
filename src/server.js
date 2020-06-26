import { GraphQLServer } from 'graphql-yoga'

import { schema } from './graphql'
import {
  startDatabase,
  // dropDatabase,
  closeDatabase,
  models,
  // bulkInsertJHUData,
} from './database'

process.env.NODE_ENV = process.env.NODE_ENV ?? 'development'

const PORT = process.env.PORT ?? 3000

/**
 * Start a graphql server
 * @param {import('graphql-yoga/dist/types').Props} options
 */
async function startServer(options = {}) {
  const server = new GraphQLServer({
    schema,
    context: { models },
  })

  try {
    const started = await server.start({
      port: PORT,
      endpoint: '/graphql',
      playground: '/playground',
      ...options,
    })

    console.log(`GraphQL server started, listening on port ${PORT}.`)
    return started
  } catch (error) {
    console.log('Could not start GraphQL server')
    console.error(error)
  }
}

export async function start() {
  await startDatabase()

  // await dropDatabase()
  // await bulkInsertJHUData()

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
