// import { loadSchemaSync } from '@graphql-tools/load'
// import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import {
  // addResolversToSchema,
  makeExecutableSchema,
} from '@graphql-tools/schema'

import { resolvers } from './resolvers'

const typeDefs = `
scalar Date
scalar ObjectID

type Query {
  entries(where: EntriesWhereInput!): [Entry!]
}

input EntriesWhereInput {
  uid: Int
  fips: Int
  state: String
  county: String
}

type Entry {
  id: ObjectID!
  uid: Int
  country_iso2: String
  country_iso3: String!
  country_code: Int!
  fips: Int!
  county: String
  state: String
  country: String!
  combined_name: String!
  population: Int!
  loc: Location!
  date: Date!
  confirmed: Int!
}

type Location {
  type: String!
  coordinates: [Float!]!
}
`

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
