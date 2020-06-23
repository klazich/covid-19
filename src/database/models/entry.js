import { model, Schema } from 'mongoose'

const entrySchema = new Schema({
  uid: {
    type: Number,
    required: true,
  },

  country_iso2: String,

  country_iso3: {
    type: String,
    required: true,
  },

  country_code: {
    type: Number,
    required: true,
  },

  fips: {
    type: Number,
    required: true,
  },

  county: String,

  state: String,

  country: {
    type: String,
    required: true,
  },

  combined_name: {
    type: String,
    required: true,
  },

  population: {
    type: Number,
    required: true,
  },

  loc: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },

  date: {
    type: Date,
    required: true,
  },

  confirmed: {
    type: Number,
    required: true,
  },
})

entrySchema.index({ country_iso3: 1, date: 1 })
entrySchema.index({ uid: 1, date: 1 })
entrySchema.index({ date: 1 })
entrySchema.index({ loc: '2dsphere' })
entrySchema.index({ country: 1, date: 1 })
entrySchema.index({ country: 1, state: 1, date: 1 })
entrySchema.index({ country: 1, state: 1, county: 1, date: 1 })

const Entry = model('Entry', entrySchema)

export default Entry
