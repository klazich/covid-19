import Koa from 'koa'
import mount from 'koa-mount'
import graphqlHTTP from 'koa-graphql'
import gracefulShutdown from 'http-graceful-shutdown'

import { buildGraphqlSchema, schema } from './graphql'
import { startDatabase, dropDatabase, closeDatabase, models } from './database'
import { bulkInsertJHUData } from './database/populate'

export async function startServer() {
  await startDatabase()
  await dropDatabase()
  await bulkInsertJHUData()

  const app = new Koa()

  // let schema
  // try {
  //   schema = await buildGraphqlSchema()
  // } catch (error) {
  //   console.error(error)
  // }

  app.use(
    mount(
      '/graphql',
      graphqlHTTP({
        schema,
        graphiql: true,
        context: { models },
        pretty: true,
      })
    )
  )

  app.on('error', (err) => {
    log.error('server error', err)
  })

  const port = process.env.PORT

  app.listen(port, () => {
    console.log(`koa server at http://localhost:${port}`)
    console.log(`graphiql playground at http://localhost:${port}/graphql`)
  })

  process.on('SIGINT', async () => {
    gracefulShutdown(app)
    await closeDatabase()
  })
}

startServer()
