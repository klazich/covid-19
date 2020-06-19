import { loadSchema } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'

export async function buildGraphqlSchema() {
  const schema = await loadSchema('./definitions/queries.graphql', {
    loaders: [GraphQLFileLoader()],
  })

  return schema
}
