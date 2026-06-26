import Dexie from 'dexie'

export const INBOX_STATUS = {
  PENDING: 'pending',
  ARCHIVED: 'archived',
}

export const TASK_STATUS = {
  TODO: 'todo',
  DONE: 'done',
}

export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const TASK_CONTEXT = {
  WORK: 'work',
  LIFE: 'life',
  ON_THE_GO: 'on-the-go',
}

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

class PersonalOSDatabase extends Dexie {
  constructor() {
    super('PersonalOS')

    this.version(1).stores({
      inbox: 'id, status, createdAt',
      tasks: 'id, status, priority, context, projectId, sourceInboxId, createdAt',
      projects: 'id, status, createdAt',
    })
  }
}

export const db = new PersonalOSDatabase()

export function createId() {
  return crypto.randomUUID()
}

export async function addInboxItem(text) {
  const item = {
    id: createId(),
    text: text.trim(),
    status: INBOX_STATUS.PENDING,
    createdAt: Date.now(),
  }
  await db.inbox.add(item)
  return item
}

export async function archiveInboxItem(id) {
  await db.inbox.update(id, { status: INBOX_STATUS.ARCHIVED })
}

export async function convertInboxToTask(inboxId, { priority, context, projectId }) {
  const inboxItem = await db.inbox.get(inboxId)
  if (!inboxItem) return null

  const task = {
    id: createId(),
    title: inboxItem.text,
    status: TASK_STATUS.TODO,
    priority: priority || TASK_PRIORITY.MEDIUM,
    context: context || TASK_CONTEXT.WORK,
    projectId: projectId || null,
    sourceInboxId: inboxId,
    createdAt: Date.now(),
  }

  await db.transaction('rw', db.inbox, db.tasks, async () => {
    await db.tasks.add(task)
    await db.inbox.update(inboxId, { status: INBOX_STATUS.ARCHIVED })
  })

  return task
}

export async function completeTask(id) {
  await db.tasks.update(id, {
    status: TASK_STATUS.DONE,
    completedAt: Date.now(),
  })
}

export async function reopenTask(id) {
  await db.tasks.update(id, {
    status: TASK_STATUS.TODO,
    completedAt: null,
  })
}

export async function assignTaskToProject(taskId, projectId) {
  await db.tasks.update(taskId, { projectId: projectId || null })
}

export async function addProject(name, description = '') {
  const project = {
    id: createId(),
    name: name.trim(),
    description: description.trim(),
    status: PROJECT_STATUS.ACTIVE,
    createdAt: Date.now(),
  }
  await db.projects.add(project)
  return project
}

export async function getAllData() {
  const [inbox, tasks, projects] = await Promise.all([
    db.inbox.toArray(),
    db.tasks.toArray(),
    db.projects.toArray(),
  ])
  return { inbox, tasks, projects }
}
