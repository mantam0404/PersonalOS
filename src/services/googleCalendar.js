const TOKEN_STORAGE_KEY = 'personal-os-google-calendar-token'
const OAUTH_PENDING_KEY = 'personal-os-google-oauth-pending'
const OAUTH_STARTED_AT_KEY = 'personal-os-google-oauth-started-at'
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'

let scriptLoadPromise = null

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

export function isGoogleCalendarConfigured() {
  return Boolean(getGoogleClientId())
}

export function getGoogleOAuthOriginHints() {
  const port = window.location.port || '5173'
  const origins = new Set([
    window.location.origin.replace(/\/$/, ''),
    `http://127.0.0.1:${port}`,
    `http://localhost:${port}`,
  ])
  return [...origins]
}

// Legacy name kept for UI imports.
export function getOAuthRedirectUriHints() {
  return getGoogleOAuthOriginHints()
}

export function readOAuthReturnError() {
  const search = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const error = search.get('error') || hash.get('error')
  if (!error) return null

  const description = search.get('error_description') || hash.get('error_description') || error
  return description.replace(/\+/g, ' ')
}

export function readOAuthReturnToken() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const accessToken = hash.get('access_token')
  if (!accessToken) return null

  return {
    accessToken,
    expiresIn: Number(hash.get('expires_in') || 3600),
  }
}

export function hasOAuthReturnInUrl() {
  if (readOAuthReturnError()) return true
  if (readOAuthReturnToken()) return true

  const hash = window.location.hash
  const search = window.location.search
  return hash.includes('access_token=')
    || hash.includes('error=')
    || search.includes('code=')
    || search.includes('error=')
}

export function isOAuthRedirectReturn() {
  return Boolean(readOAuthReturnError() || readOAuthReturnToken())
}

export function consumeOAuthReturn() {
  const returnedToken = readOAuthReturnToken()
  if (!returnedToken) return null

  storeToken(returnedToken.accessToken, returnedToken.expiresIn)
  clearOAuthReturnParams()
  return returnedToken.accessToken
}

export function clearOAuthReturnParams() {
  const url = new URL(window.location.href)
  const oauthKeys = [
    'error',
    'error_description',
    'state',
    'code',
    'access_token',
    'token_type',
    'expires_in',
    'scope',
    'authuser',
    'prompt',
  ]
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
    sessionStorage.removeItem(OAUTH_STARTED_AT_KEY)
  } catch {
    // ignore storage errors
  }
}

export function abortPendingGoogleOAuth() {
  clearOAuthPending()
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

function buildTokenClient(clientId, { onSuccess, onError }) {
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: CALENDAR_SCOPE,
    callback: () => {},
    error_callback: onError,
  })

  client.callback = onSuccess
  return client
}

export async function connectGoogleCalendar() {
  const clientId = getGoogleClientId()
  if (!clientId) {
    throw new Error('未設定 VITE_GOOGLE_CLIENT_ID，無法連接 Google Calendar')
  }

  await loadGoogleIdentityScript()

  return new Promise((resolve, reject) => {
    let settled = false

    const finish = (handler, value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      handler(value)
    }

    const timeoutId = window.setTimeout(() => {
      finish(reject, new Error('Google 授權逾時，請在 Cursor Ports 面板確認 5173 已開啟後再試'))
    }, 120_000)

    const client = buildTokenClient(clientId, {
      onSuccess: (response) => {
        if (response?.error) {
          finish(reject, new Error(response.error_description || response.error))
          return
        }
        if (!response?.access_token) {
          finish(reject, new Error('未取得 Google 授權，請再試一次'))
          return
        }
        storeToken(response.access_token, response.expires_in)
        finish(resolve, response.access_token)
      },
      onError: (error) => {
        if (error?.type === 'popup_failed_to_open' || error?.type === 'popup_closed') {
          finish(
            reject,
            new Error(
              '無法開啟 Google 授權視窗。請在 Cursor Agent 的 Ports 面板點 5173 開啟預覽後再連接（不要在外部瀏覽器直接輸入 127.0.0.1）。',
            ),
          )
          return
        }
        finish(reject, new Error(error?.message || error?.type || 'Google OAuth 失敗'))
      },
    })

    client.requestAccessToken({ prompt: getStoredToken() ? '' : 'consent' })
  })
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
    const message = err.error?.message || '無法取得 Google Calendar 資料'
    if (message.includes('has not been used') || message.includes('accessNotConfigured')) {
      throw new Error('請在 Google Cloud Console 啟用 Google Calendar API')
    }
    if (response.status === 403) {
      throw new Error('沒有日曆讀取權限，請重新連接並允許 Calendar 存取')
    }
    throw new Error(message)
  }

  const data = await response.json()
  return parseGoogleCalendarEvents(data.items || [])
}
