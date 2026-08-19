import { db } from '../schema'
import { createId } from '../helpers'

export async function logActivity({ projectId, entry, hoursLogged = 0, source = 'voice' }) {
  const row = {
    id: createId(),
    projectId,
    entry: entry.trim(),
    hoursLogged: hoursLogged || 0,
    loggedAt: Date.now(),
    source,
  }
  await db.activityLog.add(row)
  await db.projects.update(projectId, { lastTouchedAt: Date.now() })
  return row
}

export async function getProjectActivity(projectId, limit = 20) {
  return db.activityLog
    .where('projectId')
    .equals(projectId)
    .reverse()
    .sortBy('loggedAt')
    .then((rows) => rows.slice(0, limit))
}
