import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

function sortByCreatedAtDesc(items) {
  return items.sort((a, b) => b.createdAt - a.createdAt)
}

export function useInboxItems(status = 'pending') {
  return useLiveQuery(
    () =>
      db.inbox
        .where('status')
        .equals(status)
        .toArray()
        .then(sortByCreatedAtDesc),
    [status],
  )
}

export function useTasks(status = 'todo') {
  return useLiveQuery(
    () =>
      db.tasks
        .where('status')
        .equals(status)
        .toArray()
        .then(sortByCreatedAtDesc),
    [status],
  )
}

export function useAllTasks() {
  return useLiveQuery(() => db.tasks.toArray(), [])
}

export function useProjects(domainId = null) {
  return useLiveQuery(
    () => {
      let query = db.projects.where('status').equals('active')
      return query
        .toArray()
        .then((items) => {
          const filtered = domainId ? items.filter((p) => p.domainId === domainId) : items
          return sortByCreatedAtDesc(filtered)
        })
    },
    [domainId],
  )
}

export function useDomains() {
  return useLiveQuery(() => db.domains.orderBy('sortOrder').toArray(), [])
}

export function useProjectsByDomain() {
  const domains = useDomains()
  const projects = useProjects()

  if (!domains || !projects) return null

  return domains.map((domain) => ({
    domain,
    projects: projects.filter((p) => p.domainId === domain.id),
  }))
}

export function useIndexedDB() {
  return { db }
}
