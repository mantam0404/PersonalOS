import { db } from '../schema'
import { createId, getTodayKey, seededPick } from '../helpers'
import { getDefaultDomainId } from './domains'
import { STUDY_TYPE, STUDY_STATUS } from '../constants'

const REVIEWED_KEY_PREFIX = 'personal-os-resurfacing-'

export async function addStudyHighlight(title, content = '') {
  const domainId = await getDefaultDomainId()
  const item = {
    id: createId(),
    type: STUDY_TYPE.HIGHLIGHT,
    title: title.trim(),
    content: content.trim(),
    domainId,
    projectId: null,
    status: STUDY_STATUS.READING,
    isHighlight: true,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }
  await db.studyItems.add(item)
  return item
}

export async function getHighlightStudyItems() {
  return db.studyItems.filter((item) => item.isHighlight).toArray()
}

export async function getResurfacingItem() {
  const highlights = await getHighlightStudyItems()
  if (!highlights.length) return null

  const todayKey = getTodayKey()
  const reviewedKey = `${REVIEWED_KEY_PREFIX}${todayKey}`
  const reviewedId = localStorage.getItem(reviewedKey)

  const item = seededPick(highlights, todayKey)
  return { item, reviewedId, todayKey, reviewedKey }
}

export function markResurfacingReviewed(reviewedKey, itemId) {
  localStorage.setItem(reviewedKey, itemId)
}

export async function touchStudyItem(id) {
  await db.studyItems.update(id, { lastTouchedAt: Date.now() })
}
