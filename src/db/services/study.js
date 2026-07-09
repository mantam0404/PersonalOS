import { db } from '../schema'
import { createId, getTodayKey, seededPick } from '../helpers'
import { getDefaultDomainId } from './domains'
import { STUDY_TYPE, STUDY_STATUS, TASK_STATUS, TASK_PRIORITY, TASK_TYPE } from '../constants'

const REVIEWED_KEY_PREFIX = 'personal-os-resurfacing-'

function extractTags(text) {
  const matches = text?.match(/#([\w\u4e00-\u9fff]+)/g)
  if (!matches) return []
  return [...new Set(matches.map((m) => m.slice(1)))]
}

export async function addStudyItem({
  type = STUDY_TYPE.NOTE,
  title,
  content = '',
  domainId,
  projectId = null,
  status = STUDY_STATUS.READING,
  isHighlight = false,
}) {
  const resolvedDomainId = domainId || (await getDefaultDomainId())
  const tags = extractTags(content)
  const item = {
    id: createId(),
    type,
    title: title.trim(),
    content: content.trim(),
    domainId: resolvedDomainId,
    projectId,
    status,
    isHighlight,
    tags,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }
  await db.studyItems.add(item)
  return item
}

export async function addStudyHighlight(title, content = '') {
  return addStudyItem({
    type: STUDY_TYPE.HIGHLIGHT,
    title: title.trim(),
    content: content.trim(),
    isHighlight: true,
  })
}

export async function updateStudyItem(id, updates) {
  const patch = { ...updates, lastTouchedAt: Date.now() }
  if (updates.content) {
    patch.tags = extractTags(updates.content)
  }
  await db.studyItems.update(id, patch)
  return db.studyItems.get(id)
}

export async function deleteStudyItem(id) {
  await db.transaction('rw', db.studyItems, db.studyLinks, async () => {
    await db.studyLinks.where('sourceId').equals(id).delete()
    await db.studyLinks.where('targetId').equals(id).delete()
    await db.studyItems.delete(id)
  })
}

export async function getStudyItem(id) {
  return db.studyItems.get(id)
}

export async function addStudyLink(sourceId, targetId, type = 'related') {
  const link = { id: createId(), sourceId, targetId, type }
  await db.studyLinks.add(link)
  return link
}

export async function getStudyLinks(studyId) {
  const [asSource, asTarget] = await Promise.all([
    db.studyLinks.where('sourceId').equals(studyId).toArray(),
    db.studyLinks.where('targetId').equals(studyId).toArray(),
  ])
  return [...asSource, ...asTarget]
}

export async function getRelatedStudyItems(studyId) {
  const item = await db.studyItems.get(studyId)
  if (!item) return []

  const links = await getStudyLinks(studyId)
  const linkedIds = new Set()
  for (const link of links) {
    linkedIds.add(link.sourceId === studyId ? link.targetId : link.sourceId)
  }

  const linked = await Promise.all([...linkedIds].map((id) => db.studyItems.get(id)))
  const tagMatches = item.tags?.length
    ? await db.studyItems
        .filter((s) => s.id !== studyId && s.tags?.some((t) => item.tags.includes(t)))
        .toArray()
    : []

  const seen = new Set()
  return [...linked.filter(Boolean), ...tagMatches].filter((s) => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })
}

export async function convertStudySnippetToTask(studyId, snippet, { domainId, projectId } = {}) {
  const study = await db.studyItems.get(studyId)
  if (!study) return null

  const resolvedDomainId = domainId || study.domainId || (await getDefaultDomainId())
  const task = {
    id: createId(),
    title: snippet.trim().slice(0, 200),
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    domainId: resolvedDomainId,
    type: TASK_TYPE.TASK,
    isDailyHighlight: false,
    projectId: projectId || study.projectId || null,
    sourceStudyId: studyId,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }

  await db.transaction('rw', db.tasks, db.studyLinks, async () => {
    await db.tasks.add(task)
    await db.studyLinks.add({
      id: createId(),
      sourceId: studyId,
      targetId: task.id,
      targetType: 'task',
      type: 'derived',
    })
  })

  return task
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
