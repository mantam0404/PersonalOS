const TOKEN_STORAGE_KEY = 'personal-os-google-calendar-token'
const OAUTH_PENDING_KEY = 'personal-os-google-oauth-pending'
const OAUTH_REDIRECT_KEY = 'personal-os-google-use-redirect'
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'
const CONNECT_TIMEOUT_MS = 90_000
const POPUP_CONNECT_TIMEOUT_MS = 20_000

let scriptLoadPromise = null

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

export function isGoogleCalendarConfigured() {
  return Boolean(getGoogleClientId())
}

export function getOAuthRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`
}

function isLocalDevHost() {
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

export function shouldPreferRedirectOAuth() {
  try {
    if (sessionStorage.getItem(OAUTH_REDIRECT_KEY) === '1') return true
    if (sessionStorage.getItem(OAUTH_PENDING_KEY) === '1') return true
  } catch {
    // ignore storage errors
  }

  // Popups are blocked in Cursor / embedded previews and many local dev setups.
  if (isLocalDevHost()) return true

  if (window.self !== window.top) return true

  const ua = navigator.userAgent || ''
  return /Electron|Cursor/i.test(ua)
}

export function getOAuthRedirectUriHints() {
  const current = getOAuthRedirectUri()
  const hints = new Set([current])

  if (window.location.hostname === '127.0.0.1') {
    hints.add(`http://localhost:${window.location.port}${window.location.pathname}`)
  } else if (window.location.hostname === 'localhost') {
    hints.add(`http://127.0.0.1:${window.location.port}${window.location.pathname}`)
  }

  return [...hints]
}

export function readOAuthReturnError() {
  const search = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const error = search.get('error') || hash.get('error')
  if (!error) return null

  return search.get('error_description')
    || hash.get('error_description')
    || error
}

export function clearOAuthReturnParams() {
  const url = new URL(window.location.href)
  const oauthKeys = ['error', 'error_description', 'state', 'code']
  let changed = false

  for (const key of oauthKeys) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  }

  if (url.hash) {
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
    for (const key of oauthKeys) {
      if (hash.has(key)) {
        hash.delete(key)
        changed = true
      }
    }
    const nextHash = hash.toString()
    url.hash = nextHash ? `#${nextHash}` : ''
  }

  if (changed) {
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)
  }
}

function clearOAuthPending() {
  try {
    sessionStorage.removeItem(OAUTH_PENDING_KEY)
  } catch {
    // ignore storage errors
  }
}

function markOAuthPending() {
  try {
    sessionStorage.setItem(OAUTH_PENDING_KEY, '1')
  } catch {
    // ignore storage errors
  }
}

function markRedirectPreferred() {
  try {
    sessionStorage.setItem(OAUTH_REDIRECT_KEY, '1')
  } catch {
    // ignore storage errors
  }
}

export function getTodayTimeRange(date = new Date()) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
  }
}

export function formatEventTime(start, end, isAllDay) {
  if (isAllDay) return '全天'
  if (!start) return ''

  const startDate = new Date(start)
  const timeStr = startDate.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  if (!end) return timeStr

  const endDate = new Date(end)
  const endTimeStr = endDate.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return `${timeStr}–${endTimeStr}`
}

export function parseGoogleCalendarEvents(items = []) {
  return items.map((item) => {
    const isAllDay = Boolean(item.start?.date)
    const start = item.start?.dateTime || item.start?.date
    const end = item.end?.dateTime || item.end?.date

    return {
      id: item.id,
      title: item.summary || '(無標題)',
      time: formatEventTime(start, end, isAllDay),
      start,
      end,
      isAllDay,
      source: 'google',
    }
  })
}

export function getStoredToken() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!raw) return null

    const { accessToken, expiresAt } = JSON.parse(raw)
    if (!accessToken || Date.now() >= expiresAt - 60_000) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      return null
    }

    return accessToken
  } catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    return null
  }
}

function storeToken(accessToken, expiresInSeconds = 3600) {
  if (!accessToken) return

  const expiresAt = Date.now() + Number(expiresInSeconds || 3600) * 1000
  localStorage.setItem(
    TOKEN_STORAGE_KEY,
    JSON.stringify({ accessToken, expiresAt }),
  )
  clearOAuthPending()
}

export function isGoogleCalendarConnected() {
  return Boolean(getStoredToken())
}

export function disconnectGoogleCalendar() {
  const token = getStoredToken()
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {})
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  clearOAuthPending()
}

function waitForGoogleIdentityScript(script) {
  return new Promise((resolve, reject) => {
    const finish = () => {
      if (window.google?.accounts?.oauth2) {
        resolve()
        return
      }
      reject(new Error('無法載入 Google 登入服務'))
    }

    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }

    if (script?.complete) {
      window.setTimeout(finish, 0)
      return
    }

    script?.addEventListener('load', finish, { once: true })
    script?.addEventListener('error', () => reject(new Error('無法載入 Google 登入服務')), {
      once: true,
    })
  })
}

export function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }

  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`)
    if (existing) {
      waitForGoogleIdentityScript(existing).then(resolve).catch(reject)
      return
    }

    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.accounts?.oauth2) resolve()
      else reject(new Error('無法載入 Google 登入服務'))
    }
    script.onerror = () => reject(new Error('無法載入 Google 登入服務'))
    document.head.appendChild(script)
  }).catch((error) => {
    scriptLoadPromise = null
    throw error
  })

  return scriptLoadPromise
}

function createTokenClient(clientId, { uxMode = 'popup', onSuccess, onError }) {
  const config = {
    client_id: clientId,
    scope: CALENDAR_SCOPE,
    ux_mode: uxMode,
    callback: () => {},
    error_callback: (error) => {
      onError(error)
    },
  }

  if (uxMode === 'redirect') {
    config.redirect_uri = getOAuthRedirectUri()
  }

  const client = window.google.accounts.oauth2.initTokenClient(config)

  client.callback = (response) => {
    if (response?.error) {
      onError(new Error(response.error_description || response.error))
      return
    }

    if (!response?.access_token) {
      onError(new Error('未取得 Google 授權，請再試一次'))
      return
    }

    storeToken(response.access_token, response.expires_in)
    onSuccess(response.access_token)
  }

  return client
}

function requestGoogleAccessToken(client, { prompt = '' } = {}) {
  client.requestAccessToken({
    prompt,
  })
}

class PopupFallbackError extends Error {
  constructor() {
    super('POPUP_FALLBACK')
    this.code = 'POPUP_FALLBACK'
  }
}

function connectWithTokenClient(clientId, { uxMode = 'popup', prompt = '' } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false
    const timeoutMs = uxMode === 'popup' ? POPUP_CONNECT_TIMEOUT_MS : CONNECT_TIMEOUT_MS

    const finish = (handler, value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      handler(value)
    }

    const timeoutId = window.setTimeout(() => {
      if (uxMode === 'popup') {
        finish(reject, new PopupFallbackError())
        return
      }
      finish(reject, new Error('連接逾時，請再試一次'))
    }, timeoutMs)

    const client = createTokenClient(clientId, {
      uxMode,
      onSuccess: (token) => finish(resolve, token),
      onError: (error) => {
        if (uxMode === 'popup' && (error?.type === 'popup_failed_to_open' || error?.type === 'popup_closed')) {
          markRedirectPreferred()
          finish(reject, new PopupFallbackError())
          return
        }

        const message = error?.message || error?.type || 'Google OAuth 失敗'
        finish(reject, new Error(message))
      },
    })

    if (uxMode === 'redirect') {
      markOAuthPending()
      markRedirectPreferred()
    }

    requestGoogleAccessToken(client, { prompt })
  })
}

export function hasPendingGoogleOAuth() {
  try {
    return sessionStorage.getItem(OAUTH_PENDING_KEY) === '1'
  } catch {
    return false
  }
}

export async function resumeGoogleCalendarAuth() {
  const clientId = getGoogleClientId()
  if (!clientId || isGoogleCalendarConnected() || !hasPendingGoogleOAuth()) {
    return null
  }

  await loadGoogleIdentityScript()

  return connectWithTokenClient(clientId, {
    uxMode: 'redirect',
    prompt: '',
  })
}

export async function connectGoogleCalendar(options = {}) {
  const clientId = getGoogleClientId()
  if (!clientId) {
    throw new Error('未設定 VITE_GOOGLE_CLIENT_ID，無法連接 Google Calendar')
  }

  await loadGoogleIdentityScript()

  const uxMode = options.uxMode || (shouldPreferRedirectOAuth() ? 'redirect' : 'popup')
  const prompt = options.prompt ?? (getStoredToken() ? '' : 'consent')

  try {
    return await connectWithTokenClient(clientId, { uxMode, prompt })
  } catch (error) {
    const shouldFallback = uxMode === 'popup'
      && !options.retried
      && (error?.code === 'POPUP_FALLBACK' || error?.message === 'POPUP_FALLBACK')

    if (shouldFallback) {
      markRedirectPreferred()
      return connectGoogleCalendar({
        uxMode: 'redirect',
        prompt,
        retried: true,
      })
    }

    throw error
  }
}

export async function fetchGoogleTodayEvents(accessToken) {
  const token = accessToken || getStoredToken()
  if (!token) {
    throw new Error('尚未連接 Google Calendar')
  }

  const { timeMin, timeMax } = getTodayTimeRange()
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '25',
  })

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (response.status === 401) {
    disconnectGoogleCalendar()
    throw new Error('授權已過期，請重新連接 Google Calendar')
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || '無法取得 Google Calendar 資料')
  }

  const data = await response.json()
  return parseGoogleCalendarEvents(data.items || [])
}
