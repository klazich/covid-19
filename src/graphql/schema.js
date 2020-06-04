import { buildSchema } from 'graphql'

export const schema = buildSchema(`
  type Location {
    type: String!
    coordinates: [Float!]!
  }
  type Entry {
    id: ID
    uid: Int!
    country_iso2: String!
    country_iso3: String!
    country_code: Int!
    fips: Int!
    county: String!
    state: String!
    country: String!
    combined_name: String!
    population: Int!
    loc: Location!
    date: String!
    confirmed: Int!
  }
  type Query {
    listEntries: [Entry]
  }
`)
