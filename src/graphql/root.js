import Entry from '../database/models/entry'

export function listEntries() {
  return Entry.find()
}

export function createEntry(input) {
  const newEntry = new Entry(input)
  return newEntry.save()
}
