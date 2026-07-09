const TOKEN_STORAGE_KEY = 'personal-os-google-calendar-token'
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'

let scriptLoadPromise = null

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

export function isGoogleCalendarConfigured() {
  return Boolean(getGoogleClientId())
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
  const expiresAt = Date.now() + expiresInSeconds * 1000
  localStorage.setItem(
    TOKEN_STORAGE_KEY,
    JSON.stringify({ accessToken, expiresAt }),
  )
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
}

export function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }

  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('無法載入 Google 登入服務')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('無法載入 Google 登入服務'))
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export async function connectGoogleCalendar() {
  const clientId = getGoogleClientId()
  if (!clientId) {
    throw new Error('未設定 VITE_GOOGLE_CLIENT_ID，無法連接 Google Calendar')
  }

  await loadGoogleIdentityScript()

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error))
          return
        }

        storeToken(response.access_token, response.expires_in)
        resolve(response.access_token)
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
    throw new Error(err.error?.message || '無法取得 Google Calendar 資料')
  }

  const data = await response.json()
  return parseGoogleCalendarEvents(data.items || [])
}
