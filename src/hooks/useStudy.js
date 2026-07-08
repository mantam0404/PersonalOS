import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getProjectMilestones } from '../db/services/milestones'

function sortByCreatedAtDesc(items) {
  return items.sort((a, b) => b.createdAt - a.createdAt)
}

export function useStudyItems(typeFilter = 'all') {
  return useLiveQuery(
    () =>
      db.studyItems
        .toArray()
        .then((items) => {
          const filtered = typeFilter === 'all' ? items : items.filter((i) => i.type === typeFilter)
          return sortByCreatedAtDesc(filtered)
        }),
    [typeFilter],
  )
}

export function useStudyItem(id) {
  return useLiveQuery(() => (id ? db.studyItems.get(id) : undefined), [id])
}

export function useStudyRelated(id) {
  return useLiveQuery(async () => {
    if (!id) return []
    const item = await db.studyItems.get(id)
    if (!item) return []

    const links = await db.studyLinks
      .filter((l) => l.sourceId === id || l.targetId === id)
      .toArray()

    const linkedIds = new Set()
    for (const link of links) {
      linkedIds.add(link.sourceId === id ? link.targetId : link.sourceId)
    }

    const linked = await Promise.all([...linkedIds].map((lid) => db.studyItems.get(lid)))
    const tagMatches = item.tags?.length
      ? await db.studyItems
          .filter((s) => s.id !== id && s.tags?.some((t) => item.tags.includes(t)))
          .toArray()
      : []

    const seen = new Set()
    return [...linked.filter(Boolean), ...tagMatches].filter((s) => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })
  }, [id])
}

export function useProjectMilestones(projectId) {
  return useLiveQuery(
    () => (projectId ? getProjectMilestones(projectId) : []),
    [projectId],
  )
}

export function useProject(projectId) {
  return useLiveQuery(() => (projectId ? db.projects.get(projectId) : undefined), [projectId])
}

export function useTaskByStudySource(studyId) {
  return useLiveQuery(async () => {
    if (!studyId) return []
    const links = await db.studyLinks
      .where('sourceId')
      .equals(studyId)
      .filter((l) => l.type === 'derived')
      .toArray()
    return Promise.all(links.map((l) => db.tasks.get(l.targetId)))
  }, [studyId])
}
