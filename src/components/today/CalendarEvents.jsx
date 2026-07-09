import { useCallback, useEffect, useState } from 'react'
import { Calendar, Loader2, RefreshCw, Unlink } from 'lucide-react'
import {
  abortPendingGoogleOAuth,
  connectGoogleCalendar,
  consumeOAuthReturn,
  disconnectGoogleCalendar,
  fetchTodayEvents,
  getGoogleOAuthOriginHints,
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
  const originHints = getGoogleOAuthOriginHints()
  const activeOrigin = originHints[0]

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
          const hint = /redirect_uri_mismatch/i.test(oauthReturnError)
            ? `此 OAuth Client 未設定 Redirect URI。請改用 GIS 彈窗模式，並在 Authorized JavaScript origins 加入：${activeOrigin}`
            : oauthReturnError
          setError(`Google 授權失敗：${hint}`)
          emitToast(`Google 授權失敗：${hint}`, 'error')
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
  }, [activeOrigin, loadEvents])

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
            將開啟 Google 授權視窗；若 Cursor 內建預覽無法彈窗，請用 Chrome 開啟此網址後再試。
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
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <p>
              請在 Google Cloud Console 的
              {' '}
              <strong>Authorized JavaScript origins</strong>
              {' '}
              加入（不是 Redirect URIs）：
            </p>
            <code className="block rounded bg-cyan-500/10 px-1 text-cyan-700 dark:text-cyan-300">{activeOrigin}</code>
            {originHints.slice(1).map((origin) => (
              <code key={origin} className="block rounded bg-slate-200 px-1 dark:bg-slate-800">{origin}</code>
            ))}
            <p className="pt-1">
              並確認已啟用
              {' '}
              <strong>Google Calendar API</strong>
              。
            </p>
          </div>
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
