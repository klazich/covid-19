import { model, Schema } from 'mongoose'

const entrySchema = new Schema({
  uid: Number,
  country_iso2: String,
  country_iso3: String,
  country_code: Number,
  fips: Number,
  county: String,
  state: String,
  country: String,
  combined_name: String,
  population: Number,
  loc: {
    type: { type: String },
    coordinates: [Number],
  },
  date: Date,
  confirmed: Number,
})

export default model('Entry', entrySchema)
