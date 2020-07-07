import { GraphQLServer } from 'graphql-yoga'

import {
  openDatabaseConnection,
  closeDatabaseConnection,
  models,
} from '../database'
import { resolvers, defaultPlaygroundQuery } from './resolvers'

const graphQLServer = new GraphQLServer({
  typeDefs: './src/server/types.graphql',
  resolvers,
  context: { models },
})

async function startGraphQLServer() {
  await openDatabaseConnection()

  let server // Will hold the server instance

  try {
    server = await graphQLServer.start(
      {
        // tracing: true,
        port: process.env.PORT,
        playground: '/playground',
        defaultPlaygroundQuery,
      },
      ({ port }) => {
        console.log(`GraphQL server started, listening on port ${port}.`)
        if (process.env.NODE_ENV === 'development') {
          console.log(`GraphQL playground at endpoint: /playground`)
        }
      }
    )
  } catch (error) {
    console.log('Could not start GraphQL server')
    console.error(error)
  }

  process.on('SIGINT', async () => {
    // Try to shutdown the graphql server
    try {
      await server.close()
      console.log('Successfully closed GraphQL server')
    } catch (error) {
      console.log('Could not close GraphQL server')
      console.error(error)
    } finally {
      await closeDatabaseConnection() // Try to close db connection
    }
  })
}

startGraphQLServer() // Spin up the server
