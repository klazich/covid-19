export const typeDefs = `
scalar Date
scalar ObjectID

type Query {
  entries(where: EntriesWhereInput!): [Entry!]
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
