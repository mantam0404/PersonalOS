import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getNotifications, getUnreadNotificationCount } from '../db/services/notifications'
import { getPendingCaptures } from '../db/services/pendingCaptures'
import { getDomainStatus, getDueTasks, getSlippingDaysThreshold } from '../db/services/today'

export function useNotifications(limit = 50) {
  return useLiveQuery(() => getNotifications(limit), [limit])
}

export function useUnreadNotificationCount() {
  return useLiveQuery(() => getUnreadNotificationCount(), [])
}

export function usePendingCaptures() {
  return useLiveQuery(() => getPendingCaptures(), [])
}

export function useDomainStatus() {
  return useLiveQuery(() => getDomainStatus(), [])
}

export function useDueTasks() {
  return useLiveQuery(() => getDueTasks(), [])
}

export function useSlippingDaysThreshold() {
  return useLiveQuery(() => getSlippingDaysThreshold(), [])
}

export function useQuoteAnnotations(studyId) {
  return useLiveQuery(
    () => (studyId ? db.quoteAnnotations.where('studyId').equals(studyId).reverse().sortBy('createdAt') : []),
    [studyId],
  )
}
