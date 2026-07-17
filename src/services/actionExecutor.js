import { db } from '../db/schema'
import { createId } from '../db/helpers'
import {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_TYPE,
  TASK_SOURCE,
  STUDY_TYPE,
  STUDY_STATUS,
} from '../db/constants'
import { getDefaultDomainId } from '../db/services/domains'
import { addNotification } from '../db/services/notifications'
import { addPendingCapture } from '../db/services/pendingCaptures'
import { logActivity } from '../db/services/activityLog'
import { resolveSingleMatch } from './matching'

async function createTaskAction(action, { domainId, source = TASK_SOURCE.VOICE } = {}) {
  const resolvedDomainId = domainId || (await getDefaultDomainId())
  const task = {
    id: createId(),
    title: action.title.trim(),
    status: TASK_STATUS.TODO,
    priority: action.priority || TASK_PRIORITY.MEDIUM,
    domainId: resolvedDomainId,
    type: TASK_TYPE.TASK,
    isDailyHighlight: false,
    projectId: action.projectId || null,
    parentTaskId: action.parentTaskId || null,
    dueDate: action.dueDate || null,
    source,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }

  if (action.projectName) {
    const projects = await db.projects.filter((p) => p.status === 'active').toArray()
    const { match, ambiguous, candidates } = resolveSingleMatch(action.projectName, projects)
    if (ambiguous) {
      await addPendingCapture({
        rawTranscript: action.title,
        source: 'voice',
        parsedIntent: action,
        candidates: { projects: candidates },
      })
      return { type: 'pending', reason: 'ambiguous_project', candidates }
    }
    if (match) task.projectId = match.id
  }

  await db.tasks.add(task)

  const notification = await addNotification({
    type: 'task_created',
    title: '已建立待辦',
    body: task.title,
    sourceRef: { table: 'tasks', id: task.id },
    undoPayload: { table: 'tasks', id: task.id, action: 'delete' },
  })

  return { type: 'task_created', task, notification }
}

async function completeTaskAction(action) {
  const tasks = await db.tasks.filter((t) => t.status === TASK_STATUS.TODO).toArray()
  const query = action.title || action.taskTitle || ''
  const { match, ambiguous, candidates } = resolveSingleMatch(query, tasks, 'title')

  if (ambiguous) {
    await addPendingCapture({
      rawTranscript: query,
      source: 'voice',
      parsedIntent: action,
      candidates: { tasks: candidates },
    })
    return { type: 'pending', reason: 'ambiguous_task', candidates }
  }

  if (!match) {
    return { type: 'not_found', query }
  }

  const previous = { ...match }
  await db.tasks.update(match.id, {
    status: TASK_STATUS.DONE,
    completedAt: Date.now(),
    lastTouchedAt: Date.now(),
  })

  const notification = await addNotification({
    type: 'task_completed',
    title: '已完成待辦',
    body: match.title,
    sourceRef: { table: 'tasks', id: match.id },
    undoPayload: { table: 'tasks', id: match.id, previous },
  })

  return { type: 'task_completed', task: match, notification }
}

async function createStudyAction(action, studyType = STUDY_TYPE.NOTE) {
  const domainId = await getDefaultDomainId()
  const studyItem = {
    id: createId(),
    type: studyType,
    title: (action.title || action.content || '').slice(0, 60),
    content: action.content || action.title || '',
    domainId,
    projectId: null,
    status: STUDY_STATUS.READING,
    isHighlight: false,
    tags: [],
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }

  await db.studyItems.add(studyItem)

  const notification = await addNotification({
    type: 'study_created',
    title: studyType === STUDY_TYPE.JOURNAL ? '已寫入日誌' : '已建立筆記',
    body: studyItem.title,
    sourceRef: { table: 'studyItems', id: studyItem.id },
    undoPayload: { table: 'studyItems', id: studyItem.id, action: 'delete' },
  })

  return { type: 'study_created', studyItem, notification }
}

async function logActivityAction(action) {
  const projects = await db.projects.filter((p) => p.status === 'active').toArray()
  const projectName = action.projectName || action.entry || ''
  const { match, ambiguous, candidates } = resolveSingleMatch(projectName, projects)

  if (!match) {
    if (ambiguous) {
      await addPendingCapture({
        rawTranscript: action.entry,
        source: 'voice',
        parsedIntent: action,
        candidates: { projects: candidates },
      })
      return { type: 'pending', reason: 'ambiguous_project', candidates }
    }
    return { type: 'not_found', query: projectName }
  }

  const row = await logActivity({
    projectId: match.id,
    entry: action.entry || projectName,
    hoursLogged: action.hours || 0,
    source: 'voice',
  })

  const notification = await addNotification({
    type: 'activity_logged',
    title: '已記錄工時',
    body: `${match.name} · ${action.hours || 0}h`,
    sourceRef: { table: 'activityLog', id: row.id },
    undoPayload: { table: 'activityLog', id: row.id, action: 'delete' },
  })

  return { type: 'activity_logged', row, notification }
}

export async function executeAction(action, options = {}) {
  switch (action.type) {
    case 'create_task':
      return createTaskAction(action, options)
    case 'complete_task':
      return completeTaskAction(action)
    case 'create_study':
      return createStudyAction(action, STUDY_TYPE.NOTE)
    case 'create_journal':
      return createStudyAction(action, STUDY_TYPE.JOURNAL)
    case 'log_activity':
      return logActivityAction(action)
    default:
      return { type: 'unknown', action }
  }
}

export async function executeVoiceActions(transcript, options = {}) {
  const { parseVoiceActions } = await import('./voiceParser')
  const { actions, source } = await parseVoiceActions(transcript)
  const results = []

  for (const action of actions) {
    const result = await executeAction(action, options)
    results.push(result)
  }

  return { actions, results, source }
}
