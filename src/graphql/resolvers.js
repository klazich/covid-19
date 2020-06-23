import { DateResolver } from 'graphql-scalars'

export const resolvers = {
  Date: DateResolver,
  Query: {
    entriesByStateAndCounty: async (_, { state, county }, { models }) =>
      await models.Entry.find({ state, county }),
    entriesByUID: async (_, { uid }, { models }) =>
      await models.Entry.find({ uid }),
    entriesByFIPS: async (_, { fips }, { models }) =>
      await models.Entry.find({ fips }),
    counties: async (_, {}, { models }) => {
      const result = await models.Metadata.findOne({}, 'counties')
      return result.counties
    },
  },
}
