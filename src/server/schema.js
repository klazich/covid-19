import { gql } from 'apollo-server'

export const typeDefs = gql`
  scalar Date
  scalar ObjectID

  type Query {
    entries(where: EntriesWhereInput!): [Entry!]
    entry(id: ObjectID!): Entry
  }

  input EntriesWhereInput {
    "Unique Identifier for each row entry"
    uid: Int

    "Federal Information Processing Standards code that uniquely identifies counties within the USA"
    fips: Int

    "The name of the State within the USA"
    state: String

    "The name of the County within the USA"
    county: String
  }

  type Entry {
    id: ObjectID!

    "Unique Identifier for each row entry"
    uid: Int

    country_iso2: String

    country_iso3: String!

    country_code: Int!

    "Federal Information Processing Standards code that uniquely identifies counties within the USA"
    fips: Int!

    "The name of the County within the USA"
    county: String

    "The name of the State within the USA"
    state: String

    "The name of the Country (US)"
    country: String!

    combined_name: String!

    population: Int!

    loc: GeoJSONPoint!

    date: Date!

    "Aggregated confirmed case count"
    confirmed: Int!
  }

  type GeoJSONPoint {
    type: GeoJSONTypeName!

    coordinates: [Float!]!
  }

  enum GeoJSONTypeName {
    Point
  }
`

const playgroundQuery = `# Play around with different variables in the "Query Variables"
# section at the bottom. For example, another way to query for
# Jefferson County Kentucky is by using the county's fips number
# (21111), instead of the state and county property:
#
# { "where": { "fips": 21111 } }
#

query entries($where: EntriesWhereInput!) {
  entries(where: $where) {
    id
    combined_name
    population
    loc {
      type
      coordinates
    }
    date
    confirmed
  }
}`

const playgroundVariables = `{
  "where": {
    "state": "Kentucky",
    "county": "Jefferson"
  }
}`

export const defaultPlaygroundTabOptions = {
  endpoint: 'http://localhost:4000/',
  query: playgroundQuery,
  variables: playgroundVariables,
}
