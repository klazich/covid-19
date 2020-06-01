import Koa from 'koa'
import mount from 'koa-mount'
import graphqlHTTP from 'koa-graphql'

import { schema } from './graphql/schema'

const app = new Koa()

const graphqlMiddleware = graphqlHTTP({
  schema,
  graphiql: true,
})

app.use(mount('/graphql', graphqlMiddleware))

app.on('error', (err) => {
  log.error('server error', err)
})

const port = 9000

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})
