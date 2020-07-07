import { DateResolver, ObjectIDResolver } from 'graphql-scalars'

export const resolvers = {
  Date: DateResolver,
  ObjectID: ObjectIDResolver,
  Query: {
    entries: async (_, { where }, { models }) => {
      const { Entry } = models
      return await Entry.find(where)
    },
  },
}

export const defaultPlaygroundQuery = `{
  # The 3 examples below show the different ways to query the endpoint.
  # Each one should return the same data.

  # Query database by a location's state and county names:
  example1: entries(where: { state: "Kentucky", county: "Jefferson" }) {
    uid
    fips
    date
    confirmed
  }

  # Query database by a location's UID number:
  example2: entries(where: { uid: 84021111 }) {
    uid
    fips
    date
    confirmed
  }

  # Query database by a location's FIPS number:
  example3: entries(where: { fips: 21111 }) {
    uid
    fips
    date
    confirmed
  }
}`
