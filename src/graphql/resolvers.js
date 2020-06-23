import { DateResolver } from 'graphql-scalars'

export const resolvers = {
  Date: DateResolver,
  Query: {
    // entriesByStateAndCounty: async (_, { state, county }, { models }) =>
    //   await models.Entry.find({ state, county }),
    // entriesByUID: async (_, { uid }, { models }) =>
    //   await models.Entry.find({ uid }),
    // entriesByFIPS: async (_, { fips }, { models }) =>
    //   await models.Entry.find({ fips }),
    // counties: async (_, {}, { models }) => {
    //   const result = await models.Metadata.findOne({}, 'counties')
    //   return result.counties
    entries: async (_, { input }, { models }) => {
      const { Entry } = models
      const { uid, fips, state, county } = input

      const test = await Entry.findOne({
        state: 'Kentucky',
        county: 'Jefferson',
      })
      console.log(test)
      if (uid) return await Entry.find({ uid })
      else if (fips) return await Entry.find({ fips })
      else if (state && county) return await Entry.find({ state, county })
    },
  },
}
