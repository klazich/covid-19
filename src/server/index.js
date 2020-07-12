import { ApolloServer } from 'apollo-server'

import {
  openDatabaseConnection,
  closeDatabaseConnection,
  models,
} from '../database'
import { resolvers } from './resolvers'

import { typeDefs, defaultPlaygroundQuery } from './schema'

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: { models },
  engine: {
    reportSchema: true,
    graphVariant: 'current',
  },
  playground: {
    tabs: [
      {
        endpoint: 'http://localhost:4000/',
        query: defaultPlaygroundQuery,
      },
    ],
  },
})

async function startGraphQLServer() {
  await openDatabaseConnection() // Open a connection to the mongodb database

  try {
    const { url, server } = await apolloServer.listen({
      port: process.env.PORT,
    })

    console.log(`GraphQL server ready at ${url}`)

    process.on('SIGINT', async () => {
      // Try to shutdown the graphql server
      server.close(async (err) => {
        if (err) {
          console.log('Could not close GraphQL server')
          console.error(err)
        } else console.log('Successfully closed GraphQL server')
        await closeDatabaseConnection() // Try to close db connection
      })
    })
  } catch (err) {
    console.log('Could not start GraphQL server')
    console.error(err)
  }
}

startGraphQLServer() // Spin up the server
