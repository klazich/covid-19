import { GraphQLServer } from 'graphql-yoga'

import { buildGraphqlSchema, schema } from './graphql'
import { startDatabase, dropDatabase, closeDatabase, models } from './database'
import { bulkInsertJHUData } from './database/populate'

const buildServer = (options = {}) =>
  new GraphQLServer({
    schema,
    context: { models },
    ...options,
  })

async function startServer(server = buildServer(), options = {}) {
  const port = options.port ?? process.env.PORT
  try {
    const result = await server.start({
      port,
      endpoint: '/graphql',
      playground: '/playground',
      ...options,
    })
    console.log(`GraphQL server started, listening on port ${port}.`)
    return result
  } catch (error) {
    console.log('Could not start GraphQL server')
    console.error(error)
  }
}

export async function start() {
  await startDatabase()
  await dropDatabase()
  await bulkInsertJHUData()

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
