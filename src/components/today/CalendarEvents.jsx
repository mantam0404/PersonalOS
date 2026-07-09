import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { fetchTodayEvents } from '../../services/calendar'

export function CalendarEvents() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetchTodayEvents().then(setEvents)
  }, [])

  if (!events.length) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={16} />
          <span>今日行程 — 連接 Google Calendar 後顯示</span>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-cyan-400" />
        <h2 className="text-sm font-medium">今日行程</h2>
      </div>
      <ul className="space-y-1">
        {events.map((ev) => (
          <li
            key={ev.id}
            className="flex items-center justify-between rounded-lg bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <span>{ev.title}</span>
            <span className="text-xs text-slate-500">{ev.time}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
