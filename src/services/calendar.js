import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  fetchGoogleTodayEvents,
  hasPendingGoogleOAuth,
  isGoogleCalendarConnected,
  isGoogleCalendarConfigured,
  resumeGoogleCalendarAuth,
} from './googleCalendar'

const CACHE_KEY = 'personal-os-calendar-cache'

export {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  hasPendingGoogleOAuth,
  isGoogleCalendarConnected,
  isGoogleCalendarConfigured,
  resumeGoogleCalendarAuth,
}

export async function fetchTodayEvents() {
  if (isGoogleCalendarConnected()) {
    const events = await fetchGoogleTodayEvents()
    localStorage.setItem(CACHE_KEY, JSON.stringify(events))
    return events
  }

  const apiUrl = import.meta.env.VITE_CALENDAR_API_URL
  if (apiUrl && navigator.onLine) {
    try {
      const response = await fetch(`${apiUrl}/today`)
      if (!response.ok) throw new Error('Calendar fetch failed')
      const events = await response.json()
      localStorage.setItem(CACHE_KEY, JSON.stringify(events))
      return events
    } catch (err) {
      console.warn('[Calendar] API unavailable', err)
    }
  }

  if (!navigator.onLine) {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : []
  }

  return []
}

export function clearCalendarCache() {
  localStorage.removeItem(CACHE_KEY)
}
