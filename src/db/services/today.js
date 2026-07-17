import { db } from '../schema'
import { startOfDay, MS_PER_DAY } from '../helpers'
import { getSlippingDays as getSlippingDaysSetting } from './appSettings'
import { DEFAULT_SLIPPING_DAYS } from '../constants'

export async function getSlippingDaysThreshold() {
  const configured = await getSlippingDaysSetting()
  return configured ?? DEFAULT_SLIPPING_DAYS
}

export async function getSlippingItems() {
  const slippingDays = await getSlippingDaysThreshold()
  const cutoff = Date.now() - slippingDays * MS_PER_DAY

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

export async function getDueTasks() {
  const endOfToday = startOfDay() + MS_PER_DAY - 1
  const tasks = await db.tasks
    .filter((t) => t.status === 'todo' && t.dueDate != null && t.dueDate <= endOfToday)
    .toArray()

  const now = Date.now()
  return tasks
    .map((t) => ({
      ...t,
      isOverdue: t.dueDate < startOfDay(now),
    }))
    .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
}

export async function getDomainStatus() {
  const [domains, tasks, projects, slippingDays] = await Promise.all([
    db.domains.orderBy('sortOrder').toArray(),
    db.tasks.toArray(),
    db.projects.toArray(),
    getSlippingDaysThreshold(),
  ])

  const cutoff = Date.now() - slippingDays * MS_PER_DAY

  return domains.map((domain) => {
    const domainTasks = tasks.filter((t) => t.domainId === domain.id && t.status === 'todo')
    const domainProjects = projects.filter((p) => p.domainId === domain.id && p.status === 'active')
    const slippingCount =
      domainTasks.filter((t) => t.lastTouchedAt < cutoff).length +
      domainProjects.filter((p) => p.lastTouchedAt < cutoff).length

    return {
      domain,
      activeTasks: domainTasks.length,
      activeProjects: domainProjects.length,
      slippingCount,
    }
  })
}
