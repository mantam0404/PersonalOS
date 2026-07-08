import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { fetchTodayEvents, getMockEventsForDemo } from '../../services/calendar'

export function CalendarEvents() {
  const [events, setEvents] = useState([])
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    fetchTodayEvents().then(setEvents)
  }, [])

  const displayEvents = showDemo ? getMockEventsForDemo() : events

  if (!displayEvents.length && !showDemo) {
    return (
      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={16} />
          <span>今日行程 — 連接 Google Calendar 後顯示</span>
        </div>
        <button
          type="button"
          onClick={() => setShowDemo(true)}
          className="mt-2 text-xs text-blue-400 hover:underline"
        >
          查看 Demo 資料
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-cyan-400" />
        <h2 className="text-sm font-medium">今日行程</h2>
        {showDemo && (
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-500">Demo</span>
        )}
      </div>
      <ul className="space-y-1">
        {displayEvents.map((ev) => (
          <li
            key={ev.id}
            className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-sm"
          >
            <span>{ev.title}</span>
            <span className="text-xs text-slate-500">{ev.time}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
