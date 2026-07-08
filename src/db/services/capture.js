import { db } from '../schema'
import { createId } from '../helpers'
import { INBOX_STATUS, TASK_STATUS, TASK_PRIORITY, TASK_TYPE, STUDY_TYPE, STUDY_STATUS, CAPTURE_TYPE } from '../constants'
import { getDefaultDomainId } from './domains'
import { processCapture } from '../../services/ai'

function extractTags(text) {
  const matches = text.match(/#([\w\u4e00-\u9fff]+)/g)
  if (!matches) return []
  return [...new Set(matches.map((m) => m.slice(1)))]
}

export async function addInboxItem(text, captureType = CAPTURE_TYPE.TEXT) {
  const item = {
    id: createId(),
    text: text.trim(),
    rawText: text.trim(),
    status: INBOX_STATUS.PENDING,
    captureType,
    aiStatus: 'pending',
    createdAt: Date.now(),
  }
  await db.inbox.add(item)
  processInboxItem(item.id)
  return item
}

export async function processInboxItem(inboxId) {
  const item = await db.inbox.get(inboxId)
  if (!item || item.status !== INBOX_STATUS.PENDING) return

  await db.inbox.update(inboxId, { aiStatus: 'processing' })

  try {
    const result = await processCapture(item.rawText || item.text)

    await db.inbox.update(inboxId, {
      cleanedText: result.cleanedText,
      aiClassification: result.classification,
      aiConfidence: result.confidence,
      text: result.cleanedText,
      aiStatus: 'done',
    })

    if (result.confidence >= 0.7) {
      if (result.classification === 'task') {
        await autoConvertToTask(inboxId, result)
      } else if (result.classification === 'study') {
        await autoConvertToStudy(inboxId, result)
      }
    }
  } catch (err) {
    console.error('[Capture] processing failed', err)
    await db.inbox.update(inboxId, { aiStatus: 'error' })
  }
}

async function autoConvertToTask(inboxId, result) {
  const inboxItem = await db.inbox.get(inboxId)
  if (!inboxItem || inboxItem.status !== INBOX_STATUS.PENDING) return

  const domainId = await getDefaultDomainId()
  const task = {
    id: createId(),
    title: result.cleanedText,
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    domainId,
    type: TASK_TYPE.TASK,
    isDailyHighlight: false,
    projectId: null,
    sourceInboxId: inboxId,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }

  await db.transaction('rw', db.inbox, db.tasks, async () => {
    await db.tasks.add(task)
    await db.inbox.update(inboxId, {
      status: INBOX_STATUS.ARCHIVED,
      aiStatus: 'auto_task',
    })
  })
}

async function autoConvertToStudy(inboxId, result) {
  const inboxItem = await db.inbox.get(inboxId)
  if (!inboxItem || inboxItem.status !== INBOX_STATUS.PENDING) return

  const domainId = await getDefaultDomainId()
  const tags = extractTags(result.cleanedText)
  const studyItem = {
    id: createId(),
    type: STUDY_TYPE.NOTE,
    title: result.cleanedText.slice(0, 60),
    content: result.cleanedText,
    domainId,
    projectId: null,
    status: STUDY_STATUS.READING,
    isHighlight: false,
    tags,
    sourceInboxId: inboxId,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }

  await db.transaction('rw', db.inbox, db.studyItems, async () => {
    await db.studyItems.add(studyItem)
    await db.inbox.update(inboxId, {
      status: INBOX_STATUS.ARCHIVED,
      aiStatus: 'auto_study',
    })
  })
}

export async function archiveInboxItem(id) {
  await db.inbox.update(id, { status: INBOX_STATUS.ARCHIVED })
}

export async function convertInboxToTask(inboxId, { priority, domainId, projectId }) {
  const inboxItem = await db.inbox.get(inboxId)
  if (!inboxItem) return null

  const resolvedDomainId = domainId || (await getDefaultDomainId())

  const task = {
    id: createId(),
    title: inboxItem.cleanedText || inboxItem.text,
    status: TASK_STATUS.TODO,
    priority: priority || TASK_PRIORITY.MEDIUM,
    domainId: resolvedDomainId,
    type: TASK_TYPE.TASK,
    isDailyHighlight: false,
    projectId: projectId || null,
    sourceInboxId: inboxId,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }

  await db.transaction('rw', db.inbox, db.tasks, async () => {
    await db.tasks.add(task)
    await db.inbox.update(inboxId, { status: INBOX_STATUS.ARCHIVED })
  })

  return task
}

export async function convertInboxToStudy(inboxId, { domainId, type, isHighlight }) {
  const inboxItem = await db.inbox.get(inboxId)
  if (!inboxItem) return null

  const text = inboxItem.cleanedText || inboxItem.text
  const resolvedDomainId = domainId || (await getDefaultDomainId())
  const tags = extractTags(text)

  const studyItem = {
    id: createId(),
    type: type || STUDY_TYPE.NOTE,
    title: text.slice(0, 60),
    content: text,
    domainId: resolvedDomainId,
    projectId: null,
    status: STUDY_STATUS.READING,
    isHighlight: isHighlight || false,
    tags,
    sourceInboxId: inboxId,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }

  await db.transaction('rw', db.inbox, db.studyItems, async () => {
    await db.studyItems.add(studyItem)
    await db.inbox.update(inboxId, { status: INBOX_STATUS.ARCHIVED })
  })

  return studyItem
}
