import { GraphQLServer } from 'graphql-yoga'

import { schema } from './graphql'
import {
  startDatabase,
  dropDatabase,
  closeDatabase,
  models,
  bulkInsertJHUData,
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
      defaultPlaygroundQuery: `{
  # The 3 examples below show the different ways to query the endpoint.
  # Each one should return the same data.

  # Query database by a location's state and county names:
  example1: entries(where: { state: "Kentucky", county: "Jefferson" }) {
    uid
    fips
    date
    confirmed
  }

  # Query database by a location's UID number:
  example2: entries(where: { uid: 84021111 }) {
    uid
    fips
    date
    confirmed
  }

  # Query database by a location's FIPS number:
  example3: entries(where: { fips: 21111 }) {
    uid
    fips
    date
    confirmed
  }
}
`,
      ...options,
    })

    console.log(`GraphQL server started, listening on port ${PORT}.`)
    if (process.env.NODE_ENV === 'development')
      console.log(`Graphql playground at: http://localhost:${PORT}/playground`)

    return started
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
