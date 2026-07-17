import { db } from '../schema'
import { createId } from '../helpers'

export async function addQuoteAnnotation({ studyId, quoteText, annotation = '' }) {
  const row = {
    id: createId(),
    studyId,
    quoteText: quoteText.trim(),
    annotation: annotation.trim(),
    createdAt: Date.now(),
  }
  await db.quoteAnnotations.add(row)
  return row
}

export async function getQuoteAnnotations(studyId) {
  return db.quoteAnnotations
    .where('studyId')
    .equals(studyId)
    .reverse()
    .sortBy('createdAt')
}

export async function updateQuoteAnnotation(id, updates) {
  await db.quoteAnnotations.update(id, updates)
  return db.quoteAnnotations.get(id)
}

export async function deleteQuoteAnnotation(id) {
  await db.quoteAnnotations.delete(id)
}
