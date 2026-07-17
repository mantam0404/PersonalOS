import { db } from '../schema'
import { createId } from '../helpers'
import { PENDING_CAPTURE_STATUS } from '../constants'

export async function addPendingCapture({ rawTranscript, source, parsedIntent, candidates }) {
  const row = {
    id: createId(),
    rawTranscript,
    source: source || 'voice',
    parsedIntent: parsedIntent || null,
    candidates: candidates || null,
    status: PENDING_CAPTURE_STATUS.PENDING,
    capturedAt: Date.now(),
    resolvedAt: null,
  }
  await db.pendingCaptures.add(row)
  return row
}

export async function getPendingCaptures() {
  return db.pendingCaptures
    .where('status')
    .equals(PENDING_CAPTURE_STATUS.PENDING)
    .reverse()
    .sortBy('capturedAt')
}

export async function resolvePendingCapture(id) {
  await db.pendingCaptures.update(id, {
    status: PENDING_CAPTURE_STATUS.RESOLVED,
    resolvedAt: Date.now(),
  })
}
