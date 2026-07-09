import { useCallback, useEffect, useState } from 'react'
import { Calendar, Loader2, RefreshCw, Unlink } from 'lucide-react'
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  fetchTodayEvents,
  getOAuthRedirectUriHints,
  hasPendingGoogleOAuth,
  isGoogleCalendarConnected,
  isGoogleCalendarConfigured,
  clearCalendarCache,
  readOAuthReturnError,
  clearOAuthReturnParams,
  resumeGoogleCalendarAuth,
} from '../../services/calendar'
import { emitToast } from '../../context/ToastContext'

export function CalendarEvents() {
  const [events, setEvents] = useState([])
  const [connected, setConnected] = useState(() => isGoogleCalendarConnected())
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(() => hasPendingGoogleOAuth())
  const [error, setError] = useState('')
  const redirectUriHints = getOAuthRedirectUriHints()

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
        clearCalendarCache()
        setError(`Google 授權失敗：${oauthReturnError}`)
        emitToast(`Google 授權失敗：${oauthReturnError}`, 'error')
        return
      }

      if (isGoogleCalendarConnected()) {
        setConnected(true)
        await loadEvents()
        return
      }

      if (!hasPendingGoogleOAuth()) return

      setConnecting(true)
      setError('')

      try {
        await resumeGoogleCalendarAuth()
        if (cancelled) return
        setConnected(true)
        emitToast('已連接 Google Calendar', 'success')
        await loadEvents()
      } catch (err) {
        if (cancelled) return
        const message = err.message || '連接失敗'
        setError(message)
        emitToast(message, 'error')
      } finally {
        if (!cancelled) setConnecting(false)
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
      if (isGoogleCalendarConnected()) {
        setConnected(true)
        emitToast('已連接 Google Calendar', 'success')
        await loadEvents()
      }
      // Redirect mode navigates away before resolving; no further UI updates needed.
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
    emitToast('已中斷 Google Calendar 連接', 'info')
  }

  if (!connected) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Calendar size={16} className="shrink-0 text-cyan-500" />
            <span>今日行程 — 連接 Google Calendar 後顯示</span>
          </div>
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="flex min-h-9 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
          >
            {connecting ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
            {connecting ? '連接中…' : '連接 Google Calendar'}
          </button>
        </div>
        {connecting && (
          <p className="mt-2 text-xs text-slate-500">
            正在導向 Google 授權頁面；若未自動跳轉，請確認已設定 redirect URI。
          </p>
        )}
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        {!isGoogleCalendarConfigured() && (
          <p className="mt-2 text-xs text-slate-500">
            需在 Google Cloud Console 建立 OAuth Client ID，並設定環境變數
            {' '}
            <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">VITE_GOOGLE_CLIENT_ID</code>
          </p>
        )}
        {isGoogleCalendarConfigured() && (
          <p className="mt-2 text-xs text-slate-500">
            請在 Google Cloud Console 的 Authorized redirect URIs 加入：
            {redirectUriHints.map((uri) => (
              <code key={uri} className="mt-1 block rounded bg-slate-200 px-1 dark:bg-slate-800">{uri}</code>
            ))}
          </p>
        )}
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-cyan-400" />
          <h2 className="text-sm font-medium">今日行程</h2>
          {loading && <Loader2 size={14} className="animate-spin text-slate-500" />}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={loadEvents}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-label="重新整理"
            title="重新整理"
          >
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            onClick={handleDisconnect}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-red-400"
            aria-label="中斷連接"
            title="中斷連接"
          >
            <Unlink size={14} />
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {!loading && !events.length ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          今日沒有行程
        </p>
      ) : (
        <ul className="space-y-1">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-900"
            >
              <span>{ev.title}</span>
              <span className="text-xs text-slate-500">{ev.time}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
