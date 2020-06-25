import { DateResolver, ObjectIDResolver } from 'graphql-scalars'

export const resolvers = {
  Date: DateResolver,
  ObjectID: ObjectIDResolver,
  Query: {
    entries: async (_, { where }, { models }) => {
      const { Entry } = models
      console.log(where)
      const test = await Entry.findOne(where)
      console.log(test)
      return await Entry.find(where)
    },
  },
  // Entry: {
  //   id: (parent) => parent.__id,
  // },
}
