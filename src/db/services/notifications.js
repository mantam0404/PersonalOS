import { db } from '../schema'
import { createId } from '../helpers'
import { NOTIFICATION_STATUS } from '../constants'

export async function addNotification({ type, title, body, sourceRef, undoPayload }) {
  const notification = {
    id: createId(),
    type,
    title,
    body: body || '',
    sourceRef: sourceRef || null,
    status: NOTIFICATION_STATUS.UNREAD,
    undoPayload: undoPayload || null,
    createdAt: Date.now(),
  }
  await db.notifications.add(notification)
  return notification
}

export async function getNotifications(limit = 50) {
  return db.notifications.orderBy('createdAt').reverse().limit(limit).toArray()
}

export async function getUnreadNotificationCount() {
  return db.notifications.where('status').equals(NOTIFICATION_STATUS.UNREAD).count()
}

export async function markNotificationRead(id) {
  await db.notifications.update(id, { status: NOTIFICATION_STATUS.READ })
}

export async function dismissNotification(id) {
  await db.notifications.update(id, { status: NOTIFICATION_STATUS.DISMISSED })
}

export async function undoNotification(id) {
  const notification = await db.notifications.get(id)
  if (!notification?.undoPayload) return { error: 'no_undo' }

  const { table, id: recordId, previous } = notification.undoPayload

  if (table && recordId && previous) {
    await db[table].put(previous)
  } else if (table && recordId && notification.undoPayload.action === 'delete') {
    await db[table].delete(recordId)
  }

  await db.notifications.update(id, { status: NOTIFICATION_STATUS.DISMISSED })
  return { success: true }
}
