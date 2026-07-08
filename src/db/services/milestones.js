import { db } from '../schema'
import { createId } from '../helpers'

export async function addMilestone(projectId, title) {
  const existing = await db.milestones.where('projectId').equals(projectId).count()
  const milestone = {
    id: createId(),
    projectId,
    title: title.trim(),
    sortOrder: existing,
    createdAt: Date.now(),
    lastTouchedAt: Date.now(),
  }
  await db.milestones.add(milestone)
  await recalculateProjectProgress(projectId)
  return milestone
}

export async function addChecklistItem(milestoneId, text) {
  const existing = await db.checklistItems.where('milestoneId').equals(milestoneId).count()
  const item = {
    id: createId(),
    milestoneId,
    text: text.trim(),
    done: false,
    sortOrder: existing,
  }
  await db.checklistItems.add(item)
  const milestone = await db.milestones.get(milestoneId)
  if (milestone) {
    await db.milestones.update(milestoneId, { lastTouchedAt: Date.now() })
    await recalculateProjectProgress(milestone.projectId)
  }
  return item
}

export async function toggleChecklistItem(id) {
  const item = await db.checklistItems.get(id)
  if (!item) return
  await db.checklistItems.update(id, { done: !item.done })
  const milestone = await db.milestones.get(item.milestoneId)
  if (milestone) {
    await db.milestones.update(milestone.id, { lastTouchedAt: Date.now() })
    await db.projects.update(milestone.projectId, { lastTouchedAt: Date.now() })
    await recalculateProjectProgress(milestone.projectId)
  }
}

export async function deleteMilestone(id) {
  const milestone = await db.milestones.get(id)
  if (!milestone) return
  await db.transaction('rw', db.milestones, db.checklistItems, async () => {
    await db.checklistItems.where('milestoneId').equals(id).delete()
    await db.milestones.delete(id)
  })
  await recalculateProjectProgress(milestone.projectId)
}

export async function getProjectMilestones(projectId) {
  const milestones = await db.milestones
    .where('projectId')
    .equals(projectId)
    .sortBy('sortOrder')

  return Promise.all(
    milestones.map(async (m) => {
      const checklist = await db.checklistItems
        .where('milestoneId')
        .equals(m.id)
        .sortBy('sortOrder')
      return { ...m, checklist }
    }),
  )
}

export async function recalculateProjectProgress(projectId) {
  const milestones = await db.milestones.where('projectId').equals(projectId).toArray()
  if (!milestones.length) {
    await db.projects.update(projectId, { progress: 0 })
    return 0
  }

  let total = 0
  let done = 0

  for (const m of milestones) {
    const items = await db.checklistItems.where('milestoneId').equals(m.id).toArray()
    total += items.length
    done += items.filter((i) => i.done).length
  }

  const progress = total === 0 ? 0 : Math.round((done / total) * 100)
  await db.projects.update(projectId, { progress, lastTouchedAt: Date.now() })
  return progress
}

export async function getProjectWithDetails(projectId) {
  const project = await db.projects.get(projectId)
  if (!project) return null
  const milestones = await getProjectMilestones(projectId)
  return { project, milestones }
}
