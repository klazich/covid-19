import { model, Schema } from 'mongoose'

const metadataSchema = Schema({
  states: {
    type: [String],
    required: true,
  },

  counties: {
    type: [String],
    required: true,
  },

  uids: {
    type: [Number],
    required: true,
  },

  first_date: {
    type: Date,
    required: true,
  },

  last_date: {
    type: Date,
    required: true,
  },
})

const Metadata = model('Metadata', metadataSchema)

export default Metadata
