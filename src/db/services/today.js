import { db } from '../schema'
import { SLIPPING_DAYS, MS_PER_DAY } from '../helpers'

export async function getSlippingItems() {
  const cutoff = Date.now() - SLIPPING_DAYS * MS_PER_DAY

  const [tasks, projects, studyItems] = await Promise.all([
    db.tasks
      .filter((t) => t.status === 'todo' && t.lastTouchedAt < cutoff)
      .toArray(),
    db.projects
      .filter((p) => p.status === 'active' && p.lastTouchedAt < cutoff)
      .toArray(),
    db.studyItems
      .filter((s) => s.lastTouchedAt < cutoff)
      .toArray(),
  ])

  return [
    ...tasks.map((t) => ({ type: 'task', id: t.id, title: t.title, lastTouchedAt: t.lastTouchedAt })),
    ...projects.map((p) => ({ type: 'project', id: p.id, title: p.name, lastTouchedAt: p.lastTouchedAt })),
    ...studyItems.map((s) => ({
      type: 'study',
      id: s.id,
      title: s.title || s.content?.slice(0, 60) || '未命名筆記',
      lastTouchedAt: s.lastTouchedAt,
    })),
  ].sort((a, b) => a.lastTouchedAt - b.lastTouchedAt)
}
