import { useState } from 'react'
import { Bell, Undo2, X } from 'lucide-react'
import { useNotifications, useUnreadNotificationCount } from '../../hooks/usePhaseFeatures'
import { markNotificationRead, dismissNotification, undoNotification } from '../../db'

export function NotificationFeed() {
  const notifications = useNotifications()
  const unreadCount = useUnreadNotificationCount()
  const [open, setOpen] = useState(false)
  const [undoing, setUndoing] = useState(null)

  const handleOpen = () => {
    setOpen((v) => !v)
  }

  const handleUndo = async (id) => {
    setUndoing(id)
    await undoNotification(id)
    setUndoing(null)
  }

  const handleDismiss = async (id) => {
    await dismissNotification(id)
  }

  const handleMarkRead = async (id) => {
    await markNotificationRead(id)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative rounded-md p-2 text-muted transition-colors hover:bg-surface hover:text-fg"
        aria-label="通知"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-on">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-80 max-h-96 overflow-y-auto rounded-md border border-border bg-surface shadow-raised">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-semibold text-fg">通知</span>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-fg">
                <X size={16} />
              </button>
            </div>
            {!notifications?.length ? (
              <p className="p-4 text-center text-sm text-muted">沒有通知</p>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`p-3 ${n.status === 'unread' ? 'bg-accent/5' : ''}`}
                    onMouseEnter={() => n.status === 'unread' && handleMarkRead(n.id)}
                  >
                    <p className="text-sm font-medium text-fg">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-muted">{n.body}</p>}
                    <div className="mt-2 flex gap-2">
                      {n.undoPayload && (
                        <button
                          type="button"
                          disabled={undoing === n.id}
                          onClick={() => handleUndo(n.id)}
                          className="flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <Undo2 size={12} />
                          復原
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDismiss(n.id)}
                        className="text-xs text-muted hover:text-fg"
                      >
                        關閉
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
