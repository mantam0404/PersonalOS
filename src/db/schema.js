import Dexie from 'dexie'
import { DEFAULT_DOMAINS, TASK_CONTEXT } from './constants'

class PersonalOSDatabase extends Dexie {
  constructor() {
    super('PersonalOS')

    this.version(1).stores({
      inbox: 'id, status, createdAt',
      tasks: 'id, status, priority, context, projectId, sourceInboxId, createdAt',
      projects: 'id, status, createdAt',
    })

    this.version(2)
      .stores({
        inbox: 'id, status, createdAt, aiClassification',
        tasks:
          'id, status, priority, context, projectId, sourceInboxId, createdAt, domainId, type, isDailyHighlight, lastTouchedAt',
        projects: 'id, status, createdAt, domainId, endDate',
        domains: 'id, name, sortOrder, createdAt',
        routines: 'id, domainId, title, streak, lastDoneAt, createdAt',
        studyItems:
          'id, type, domainId, projectId, status, isHighlight, lastTouchedAt, createdAt',
        studyLinks: 'id, sourceId, targetId, type',
        milestones: 'id, projectId, sortOrder, createdAt',
        checklistItems: 'id, milestoneId, done, sortOrder',
      })
      .upgrade(async (tx) => {
        const domains = tx.table('domains')
        const tasks = tx.table('tasks')
        const projects = tx.table('projects')
        const inbox = tx.table('inbox')

        const existingDomains = await domains.count()
        if (existingDomains === 0) {
          const now = Date.now()
          for (const seed of DEFAULT_DOMAINS) {
            await domains.add({
              id: crypto.randomUUID(),
              name: seed.name,
              color: seed.color,
              sortOrder: seed.sortOrder,
              createdAt: now + seed.sortOrder,
            })
          }
        }

        const allDomains = await domains.toArray()
        const domainByContext = Object.fromEntries(
          DEFAULT_DOMAINS.map((seed) => [
            seed.legacyContext,
            allDomains.find((d) => d.name === seed.name)?.id,
          ]),
        )
        const workDomainId = domainByContext[TASK_CONTEXT.WORK]

        await tasks.toCollection().modify((task) => {
          if (!task.domainId) {
            task.domainId = domainByContext[task.context] || workDomainId || null
          }
          if (!task.type) task.type = 'task'
          if (task.isDailyHighlight === undefined) task.isDailyHighlight = false
          if (!task.lastTouchedAt) task.lastTouchedAt = task.createdAt
        })

        await projects.toCollection().modify((project) => {
          if (!project.domainId) project.domainId = workDomainId || null
          if (project.progress === undefined) project.progress = 0
          if (!project.lastTouchedAt) project.lastTouchedAt = project.createdAt
        })

        await inbox.toCollection().modify((item) => {
          if (!item.rawText) item.rawText = item.text
          if (!item.captureType) item.captureType = 'text'
        })
      })

    this.version(3).stores({
      inbox: 'id, status, createdAt, aiClassification',
      tasks:
        'id, status, priority, context, projectId, sourceInboxId, createdAt, domainId, type, isDailyHighlight, lastTouchedAt',
      projects: 'id, status, createdAt, domainId, endDate',
      domains: 'id, name, sortOrder, createdAt',
      routines: 'id, domainId, title, streak, lastDoneAt, createdAt',
      studyItems:
        'id, type, domainId, projectId, status, isHighlight, lastTouchedAt, createdAt',
      studyLinks: 'id, sourceId, targetId, type',
      milestones: 'id, projectId, sortOrder, createdAt',
      checklistItems: 'id, milestoneId, done, sortOrder',
      wikiNotes: 'id, obsidianPath, contentHash, mtime, syncedAt, *tags',
      wikiLinks: 'id, sourcePath, targetPath, type',
      wikiSyncState: 'key',
    })
  }
}

export const db = new PersonalOSDatabase()
