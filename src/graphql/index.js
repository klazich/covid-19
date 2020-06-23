import { join } from 'path'

import { loadSchema } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import {
  addResolversToSchema,
  makeExecutableSchema,
} from '@graphql-tools/schema'

import { resolvers } from './resolvers'

const typeDefs = `
scalar Date

type Query {
  entriesByStateAndCounty(state: String!, county: String!): [Entry]
  entriesByUID(uid: Int!): [Entry]
  entriesByFIPS(fips: Int!): [Entry]
  # uids: [Int]
  counties: [String]
}

type Entry {
  id: ID!
  uid: Int!
  country_iso2: String!
  country_iso3: String!
  country_code: Int!
  fips: Int!
  county: String
  state: String!
  country: String!
  combined_name: String!
  population: Int!
  loc: Location!
  date: Date!
  confirmed: Int!
}

type Metadata {
  id: ID!
  states: [String!]!
  counties: [String!]!
  uids: [Int!]!
  firstDate: String!
  lastDate: String!
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

export async function buildGraphqlSchema() {
  const schema = await loadSchema(join(__dirname, 'types.graphql'), {
    loaders: [new GraphQLFileLoader()],
  })

  const withResolvers = addResolversToSchema({
    schema,
    resolvers,
  })

  return withResolvers
}
