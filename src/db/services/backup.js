import { db } from '../schema'

export async function exportBackup() {
  const data = await getAllData()
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `personal-os-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  return payload
}

async function getAllData() {
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
  return { inbox, tasks, projects, domains, routines, studyItems, studyLinks, milestones, checklistItems }
}

export async function importBackup(file, { replace = false } = {}) {
  const text = await file.text()
  const payload = JSON.parse(text)
  const data = payload.data || payload

  if (!data || typeof data !== 'object') {
    throw new Error('無效的備份檔案')
  }

  const tableNames = [
    'inbox',
    'tasks',
    'projects',
    'domains',
    'routines',
    'studyItems',
    'studyLinks',
    'milestones',
    'checklistItems',
  ]

  await db.transaction('rw', tableNames.map((t) => db[t]), async () => {
    if (replace) {
      for (const table of tableNames) {
        await db[table].clear()
      }
    }

    const writers = [
      ['inbox', data.inbox],
      ['tasks', data.tasks],
      ['projects', data.projects],
      ['domains', data.domains],
      ['routines', data.routines],
      ['studyItems', data.studyItems],
      ['studyLinks', data.studyLinks],
      ['milestones', data.milestones],
      ['checklistItems', data.checklistItems],
    ]

    for (const [table, items] of writers) {
      if (!items?.length) continue
      if (replace) {
        await db[table].bulkAdd(items)
      } else {
        for (const item of items) {
          await db[table].put(item)
        }
      }
    }
  })

  return data
}
