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

export const defaultPlaygroundQuery = `{
  # The 3 examples below show the different ways to query the endpoint.
  # Each one should return the same data.

  # Query database by a location's state and county names:
  example1: entries(where: { state: "Kentucky", county: "Jefferson" }) {
    combined_name
    population
    date
    confirmed
  }

  # Query database by a location's UID number:
  example2: entries(where: { uid: 84021111 }) {
    combined_name
    population
    date
    confirmed
  }

  # Query database by a location's FIPS number:
  example3: entries(where: { fips: 21111 }) {
    combined_name
    population
    date
    confirmed
  }
}`
