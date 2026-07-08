import { db } from './schema'
import { createId } from './helpers'
import { getDefaultDomainId } from './services/domains'
import {
  INBOX_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_CONTEXT,
  TASK_TYPE,
  PROJECT_STATUS,
  CAPTURE_TYPE,
} from './constants'

export { db } from './schema'
export * from './constants'
export * from './services/domains'
export * from './services/tasks'
export * from './services/routines'
export * from './services/study'
export * from './services/today'

export async function addInboxItem(text, captureType = CAPTURE_TYPE.TEXT) {
  const item = {
    id: createId(),
    text: text.trim(),
    rawText: text.trim(),
    status: INBOX_STATUS.PENDING,
    captureType,
    createdAt: Date.now(),
  }
  await db.inbox.add(item)
  return item
}

export async function archiveInboxItem(id) {
  await db.inbox.update(id, { status: INBOX_STATUS.ARCHIVED })
}

export async function convertInboxToTask(inboxId, { priority, domainId, projectId, context }) {
  const inboxItem = await db.inbox.get(inboxId)
  if (!inboxItem) return null

  const resolvedDomainId = domainId || (await getDefaultDomainId())

  const task = {
    id: createId(),
    title: inboxItem.text,
    status: TASK_STATUS.TODO,
    priority: priority || TASK_PRIORITY.MEDIUM,
    context: context || TASK_CONTEXT.WORK,
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

export async function completeTask(id) {
  const now = Date.now()
  await db.tasks.update(id, {
    status: TASK_STATUS.DONE,
    completedAt: now,
    lastTouchedAt: now,
  })
}

export async function reopenTask(id) {
  await db.tasks.update(id, {
    status: TASK_STATUS.TODO,
    completedAt: null,
    lastTouchedAt: Date.now(),
  })
}

export async function assignTaskToProject(taskId, projectId) {
  await db.tasks.update(taskId, {
    projectId: projectId || null,
    lastTouchedAt: Date.now(),
  })
}

export async function addProject(name, { description = '', domainId } = {}) {
  const resolvedDomainId = domainId || (await getDefaultDomainId())
  const project = {
    id: createId(),
    name: name.trim(),
    description: description.trim(),
    status: PROJECT_STATUS.ACTIVE,
    domainId: resolvedDomainId,
    progress: 0,
    endDate: null,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }
  await db.projects.add(project)
  return project
}

export async function getAllData() {
  const [inbox, tasks, projects, domains, routines, studyItems, studyLinks, milestones, checklistItems] =
    await Promise.all([
      db.inbox.toArray(),
      db.tasks.toArray(),
      db.projects.toArray(),
      db.domains.toArray(),
      db.routines.toArray(),
      db.studyItems.toArray(),
      db.studyLinks.toArray(),
      db.milestones.toArray(),
      db.checklistItems.toArray(),
    ])
  return {
    inbox,
    tasks,
    projects,
    domains,
    routines,
    studyItems,
    studyLinks,
    milestones,
    checklistItems,
  }
}
