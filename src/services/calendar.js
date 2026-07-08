const CACHE_KEY = 'personal-os-calendar-cache'

export async function fetchTodayEvents() {
  const apiUrl = import.meta.env.VITE_CALENDAR_API_URL

  if (!apiUrl || !navigator.onLine) {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : []
  }

  try {
    const response = await fetch(`${apiUrl}/today`)
    if (!response.ok) throw new Error('Calendar fetch failed')
    const events = await response.json()
    localStorage.setItem(CACHE_KEY, JSON.stringify(events))
    return events
  } catch (err) {
    console.warn('[Calendar] API unavailable', err)
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : getMockEvents()
  }
}

function getMockEvents() {
  return []
}

export function getMockEventsForDemo() {
  return [
    { id: '1', title: '團隊站會', time: '10:00', source: 'mock' },
    { id: '2', title: '專案 review', time: '15:30', source: 'mock' },
  ]
}
