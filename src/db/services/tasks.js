import { db } from '../schema'
import { MAX_DAILY_HIGHLIGHTS } from '../helpers'

export async function toggleDailyHighlight(taskId) {
  const task = await db.tasks.get(taskId)
  if (!task || task.status !== 'todo') return { error: 'not_found' }

  if (task.isDailyHighlight) {
    await db.tasks.update(taskId, { isDailyHighlight: false, lastTouchedAt: Date.now() })
    return { success: true, isDailyHighlight: false }
  }

  const highlights = await db.tasks
    .filter((t) => t.isDailyHighlight && t.status === 'todo')
    .toArray()

  if (highlights.length >= MAX_DAILY_HIGHLIGHTS) {
    return { error: 'max_reached' }
  }

  await db.tasks.update(taskId, { isDailyHighlight: true, lastTouchedAt: Date.now() })
  return { success: true, isDailyHighlight: true }
}

export async function touchTask(id) {
  await db.tasks.update(id, { lastTouchedAt: Date.now() })
}

export async function handleSlippingToday(type, id) {
  if (type === 'task') {
    const result = await toggleDailyHighlight(id)
    if (result.error === 'max_reached') {
      await touchTask(id)
    }
    return result
  }

  const now = Date.now()
  if (type === 'project') {
    await db.projects.update(id, { lastTouchedAt: now })
  } else if (type === 'study') {
    await db.studyItems.update(id, { lastTouchedAt: now })
  }
  return { success: true }
}
