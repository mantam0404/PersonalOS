import { db } from './schema'
import { createId } from './helpers'
import { getDefaultDomainId } from './services/domains'
import {
  TASK_STATUS,
  PROJECT_STATUS,
} from './constants'

export { db } from './schema'
export * from './constants'
export * from './services/domains'
export * from './services/tasks'
export * from './services/routines'
export * from './services/study'
export * from './services/today'
export * from './services/capture'
export * from './services/milestones'
export * from './services/backup'
export * from './services/wiki'

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

export async function touchProject(id) {
  await db.projects.update(id, { lastTouchedAt: Date.now() })
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
