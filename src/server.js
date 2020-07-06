import { GraphQLServer } from 'graphql-yoga'

import { schema, defaultPlaygroundQuery } from './graphql'
import {
  openDatabaseConnection,
  closeDatabaseConnection,
  models,
} from './database'

const { PORT } = process.env

export async function startServer() {
  const server = new GraphQLServer({
    schema,
    context: { models },
  })

  try {
    const started = await server.start({
      port: PORT,
      endpoint: '/graphql',
      playground: '/playground',
      defaultPlaygroundQuery,
    })

    console.log(`GraphQL server started, listening on port ${PORT}.`)
    if (process.env.NODE_ENV === 'development')
      console.log(`Graphql playground at: http://localhost:${PORT}/playground`)

    return started // Return the server instance
  } catch (error) {
    console.log('Could not start GraphQL server')
    console.error(error)
  }
}

export async function start() {
  await openDatabaseConnection()
  const server = await startServer()

  process.on('SIGINT', async () => {
    // Try to shutdown the graphql server
    server.close(async (error) => {
      if (error) {
        console.log('Could not close GraphQL server')
        console.error(error)
      } else {
        console.log('Successfully closed GraphQL server')
      }
      await closeDatabaseConnection() // Try to close db connection
    })
  })
}

start() // Spin up the server
