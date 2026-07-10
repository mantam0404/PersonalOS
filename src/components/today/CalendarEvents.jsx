import { useCallback, useEffect, useState } from 'react'
import { Calendar, Loader2, RefreshCw, Unlink } from 'lucide-react'
import {
  abortPendingGoogleOAuth,
  connectGoogleCalendar,
  consumeOAuthReturn,
  disconnectGoogleCalendar,
  fetchTodayEvents,
  isGoogleCalendarConnected,
  isGoogleCalendarConfigured,
  isOAuthRedirectReturn,
  clearCalendarCache,
  readOAuthReturnError,
  clearOAuthReturnParams,
} from '../../services/calendar'
import { emitToast } from '../../context/ToastContext'

export function CalendarEvents() {
  const [events, setEvents] = useState([])
  const [connected, setConnected] = useState(() => isGoogleCalendarConnected())
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  const loadEvents = useCallback(async () => {
    if (!isGoogleCalendarConnected()) {
      setEvents([])
      setConnected(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const nextEvents = await fetchTodayEvents()
      setEvents(nextEvents)
      setConnected(true)
    } catch (err) {
      setError(err.message || '無法載入日曆')
      setConnected(isGoogleCalendarConnected())
      emitToast(err.message || '無法載入日曆', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrapConnection() {
      const oauthReturnError = readOAuthReturnError()
      if (oauthReturnError) {
        clearOAuthReturnParams()
        abortPendingGoogleOAuth()
        clearCalendarCache()
        if (!cancelled) {
          setError(`Google 授權失敗：${oauthReturnError}`)
          emitToast(`Google 授權失敗：${oauthReturnError}`, 'error')
        }
        return
      }

      if (isOAuthRedirectReturn()) {
        const token = consumeOAuthReturn()
        if (token && !cancelled) {
          setConnected(true)
          emitToast('已連接 Google Calendar', 'success')
          await loadEvents()
        }
        return
      }

      abortPendingGoogleOAuth()

      if (isGoogleCalendarConnected()) {
        setConnected(true)
        await loadEvents()
      }
    }

    bootstrapConnection()

    return () => {
      cancelled = true
    }
  }, [loadEvents])

  const handleConnect = async () => {
    if (!isGoogleCalendarConfigured()) {
      const message = '請先設定 VITE_GOOGLE_CLIENT_ID 環境變數'
      setError(message)
      emitToast(message, 'error')
      return
    }

    setConnecting(true)
    setError('')

    try {
      await connectGoogleCalendar()
      setConnected(true)
      emitToast('已連接 Google Calendar', 'success')
      await loadEvents()
    } catch (err) {
      const message = err.message || '連接失敗'
      setError(message)
      emitToast(message, 'error')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnectGoogleCalendar()
    clearCalendarCache()
    setConnected(false)
    setEvents([])
    setError('')
    setConnecting(false)
    emitToast('已中斷 Google Calendar 連接', 'info')
  }

  if (!connected) {
    return (
      <section className="rounded-md border border-dashed border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <Calendar size={20} className="mt-0.5 shrink-0 text-accent" />
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-xs leading-relaxed text-muted">
              連接 Google 日曆後，今日行程會顯示在這裡
            </p>
            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              className="flex w-full min-h-10 items-center justify-center gap-2.5 rounded-md bg-accent px-4 text-xs font-medium text-accent-on hover:bg-accent-hover disabled:opacity-60"
            >
              {connecting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Calendar size={18} strokeWidth={2} />
              )}
              <span className="whitespace-nowrap">
                {connecting ? '連接中…' : '連接日曆'}
              </span>
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-accent" />
          <h2 className="text-sm font-medium text-fg">今日行程</h2>
          {loading && <Loader2 size={14} className="animate-spin text-muted" />}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={loadEvents}
            disabled={loading}
            className="rounded-md p-1.5 text-muted hover:bg-surface-elevated"
            aria-label="重新整理"
            title="重新整理"
          >
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            onClick={handleDisconnect}
            className="rounded-md p-1.5 text-muted hover:bg-surface-elevated hover:text-danger"
            aria-label="中斷連接"
            title="中斷連接"
          >
            <Unlink size={14} />
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {!loading && !events.length ? (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
          今日沒有行程
        </p>
      ) : (
        <ul className="space-y-1">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center justify-between rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm"
            >
              <span className="text-fg">{ev.title}</span>
              <span className="text-xs text-meta">{ev.time}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
