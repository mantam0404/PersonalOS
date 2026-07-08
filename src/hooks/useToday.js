import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getResurfacingItem } from '../db/services/study'
import { getSlippingItems } from '../db/services/today'

function sortByCreatedAtDesc(items) {
  return items.sort((a, b) => b.createdAt - a.createdAt)
}

export function useDailyHighlights() {
  return useLiveQuery(
    () =>
      db.tasks
        .filter((t) => t.isDailyHighlight && t.status === 'todo')
        .toArray()
        .then(sortByCreatedAtDesc),
    [],
  )
}

export function useTodayTasks() {
  return useLiveQuery(
    () =>
      db.tasks
        .filter((t) => t.status === 'todo' && !t.isDailyHighlight && t.type !== 'routine')
        .toArray()
        .then(sortByCreatedAtDesc),
    [],
  )
}

export function useRoutines() {
  return useLiveQuery(
    () => db.routines.orderBy('createdAt').reverse().toArray(),
    [],
  )
}

export function useSlippingItems() {
  return useLiveQuery(() => getSlippingItems(), [])
}

export function useResurfacing() {
  return useLiveQuery(async () => {
    const data = await getResurfacingItem()
    if (!data) return null
    const { item, reviewedId, todayKey, reviewedKey } = data
    return {
      item,
      isReviewed: reviewedId === item.id,
      todayKey,
      reviewedKey,
    }
  }, [])
}

export function useHighlightStudyCount() {
  return useLiveQuery(
    () => db.studyItems.filter((item) => item.isHighlight).count(),
    [],
  )
}
