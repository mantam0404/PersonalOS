import { db } from '../schema'
import { createId } from '../helpers'
import { INBOX_STATUS, TASK_STATUS, TASK_PRIORITY, TASK_TYPE, STUDY_TYPE, STUDY_STATUS, CAPTURE_TYPE } from '../constants'
import { getDefaultDomainId } from './domains'
import { processCapture, isMeaningfulText } from '../../services/ai'
import { executeVoiceActions } from '../../services/actionExecutor'
import { emitToast } from '../../context/ToastContext'

function extractTags(text) {
  const matches = text.match(/#([\w\u4e00-\u9fff]+)/g)
  if (!matches) return []
  return [...new Set(matches.map((m) => m.slice(1)))]
}

export async function addInboxItem(text, captureType = CAPTURE_TYPE.TEXT) {
  const trimmed = text.trim()
  if (!isMeaningfulText(trimmed)) {
    emitToast('內容太短或無意義，請重新輸入', 'error')
    return null
  }

  if (captureType === CAPTURE_TYPE.VOICE) {
    return processVoiceCapture(trimmed)
  }

  const item = {
    id: createId(),
    text: trimmed,
    rawText: trimmed,
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
    const cleanedText = result.cleanedText?.trim()

    if (!cleanedText || cleanedText.length < 2) {
      await db.inbox.update(inboxId, {
        aiStatus: 'error',
        text: item.rawText,
      })
      emitToast('AI 處理後內容為空，請手動編輯', 'error')
      return
    }

    await db.inbox.update(inboxId, {
      cleanedText,
      aiClassification: result.classification,
      aiConfidence: result.confidence,
      text: cleanedText,
      aiStatus: 'done',
    })

    if (result.confidence >= 0.7) {
      if (result.classification === 'task') {
        const task = await autoConvertToTask(inboxId, result)
        if (task) emitToast(`已自動建立待辦：${task.title.slice(0, 40)}`, 'success')
      } else if (result.classification === 'study') {
        const study = await autoConvertToStudy(inboxId, result)
        if (study) emitToast(`已自動建立筆記：${study.title.slice(0, 40)}`, 'success')
      }
    }
  } catch (err) {
    console.error('[Capture] processing failed', err)
    await db.inbox.update(inboxId, { aiStatus: 'error' })
    emitToast('AI 處理失敗，請手動轉化', 'error')
  }
}

async function autoConvertToTask(inboxId, result) {
  const inboxItem = await db.inbox.get(inboxId)
  if (!inboxItem || inboxItem.status !== INBOX_STATUS.PENDING) return null

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

  return task
}

async function autoConvertToStudy(inboxId, result) {
  const inboxItem = await db.inbox.get(inboxId)
  if (!inboxItem || inboxItem.status !== INBOX_STATUS.PENDING) return null

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

  return studyItem
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

  emitToast(`已建立待辦：${task.title.slice(0, 40)}`, 'success')
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

  emitToast(`已建立筆記：${studyItem.title.slice(0, 40)}`, 'success')
  return studyItem
}

export async function processVoiceCapture(transcript) {
  const item = {
    id: createId(),
    text: transcript,
    rawText: transcript,
    status: INBOX_STATUS.PENDING,
    captureType: CAPTURE_TYPE.VOICE,
    aiStatus: 'processing',
    createdAt: Date.now(),
  }
  await db.inbox.add(item)

  try {
    const { results, source } = await executeVoiceActions(transcript)

    const succeeded = results.filter((r) =>
      ['task_created', 'task_completed', 'study_created', 'activity_logged'].includes(r.type),
    )
    const pending = results.filter((r) => r.type === 'pending')

    if (succeeded.length) {
      const summary = succeeded.map((r) => r.notification?.title || r.type).join('、')
      emitToast(`${summary}（${source === 'llm' ? 'AI' : '本地'}）`, 'success')
      await db.inbox.update(item.id, {
        status: INBOX_STATUS.ARCHIVED,
        aiStatus: 'voice_action',
      })
    } else if (pending.length) {
      emitToast('語音指令需要確認 — 請在待處理佇列中選擇', 'info')
      await db.inbox.update(item.id, { aiStatus: 'voice_pending' })
    } else {
      await processInboxItem(item.id)
    }

    return { item, results, source }
  } catch (err) {
    console.error('[Capture] voice action failed', err)
    await db.inbox.update(item.id, { aiStatus: 'error' })
    emitToast('語音處理失敗，已存入收件匣', 'error')
    return { item, error: err.message }
  }
}
