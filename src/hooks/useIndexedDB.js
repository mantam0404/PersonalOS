import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useInboxItems(status = 'pending') {
  return useLiveQuery(
    () =>
      db.inbox
        .where('status')
        .equals(status)
        .toArray()
        .then((items) => items.sort((a, b) => b.createdAt - a.createdAt)),
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
        .then((items) => items.sort((a, b) => b.createdAt - a.createdAt)),
    [status],
  )
}

export function useAllTasks() {
  return useLiveQuery(() => db.tasks.toArray(), [])
}

export function useProjects() {
  return useLiveQuery(
    () =>
      db.projects
        .where('status')
        .equals('active')
        .toArray()
        .then((items) => items.sort((a, b) => b.createdAt - a.createdAt)),
    [],
  )
}

export function useIndexedDB() {
  return { db }
}
