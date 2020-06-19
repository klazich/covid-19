import Koa from 'koa'
import mount from 'koa-mount'
import graphqlHTTP from 'koa-graphql'

import { schema } from './graphql/schema'
import { root } from './graphql/root'
import { models } from './database'

export default async function initServer() {
  const app = new Koa()

  app.use(
    mount(
      '/graphql',
      graphqlHTTP({
        schema,
        rootValue: root,
        graphiql: true,
        context: { models },
      })
    )
  )

  app.on('error', (err) => {
    log.error('server error', err)
  })

  const port = process.env.PORT

  app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
  })
}
