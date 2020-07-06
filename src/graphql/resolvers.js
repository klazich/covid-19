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
