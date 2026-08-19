import { db } from '../schema'

const ALL_TABLES = [
  'inbox',
  'tasks',
  'projects',
  'domains',
  'routines',
  'studyItems',
  'studyLinks',
  'milestones',
  'checklistItems',
  'wikiNotes',
  'wikiLinks',
  'wikiSyncState',
  'notifications',
  'pendingCaptures',
  'activityLog',
  'appSettings',
  'quoteAnnotations',
]

async function getAllData() {
  const results = await Promise.all(ALL_TABLES.map((t) => db[t].toArray()))
  return Object.fromEntries(ALL_TABLES.map((t, i) => [t, results[i]]))
}

export async function exportBackup() {
  const data = await getAllData()
  const payload = {
    version: 4,
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

export async function importBackup(file, { replace = false } = {}) {
  const text = await file.text()
  const payload = JSON.parse(text)
  const data = payload.data || payload

  if (!data || typeof data !== 'object') {
    throw new Error('無效的備份檔案')
  }

  const tableNames = ALL_TABLES.filter((t) => db[t])

  await db.transaction('rw', tableNames.map((t) => db[t]), async () => {
    if (replace) {
      for (const table of tableNames) {
        await db[table].clear()
      }
    }

    for (const table of tableNames) {
      const items = data[table]
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
