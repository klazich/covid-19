import { DateResolver, ObjectIDResolver } from 'graphql-scalars'

export const resolvers = {
  Date: DateResolver,
  ObjectID: ObjectIDResolver,
  Query: {
    entries: async (_, { where }, { models }) => {
      const { Entry } = models
      return await Entry.find(where)
    },
    entry: async (_, { id }, { models }) => {
      const { Entry } = models
      return await Entry.findById(id)
    },
  },
}
