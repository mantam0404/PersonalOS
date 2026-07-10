import { useState } from 'react'
import { Star, Circle } from 'lucide-react'
import { useDailyHighlights } from '../../hooks/useToday'
import { toggleDailyHighlight, completeTask } from '../../db'
import { PriorityBadge } from '../ui/Badge'
import { MAX_DAILY_HIGHLIGHTS } from '../../db/helpers'

export function DailyHighlights({ embedded = false }) {
  const highlights = useDailyHighlights()
  const [message, setMessage] = useState('')

  const handleToggleStar = async (task) => {
    if (task.isDailyHighlight) {
      await toggleDailyHighlight(task.id)
      return
    }
    const result = await toggleDailyHighlight(task.id)
    if (result.error === 'max_reached') {
      setMessage(`今日重點已滿（最多 ${MAX_DAILY_HIGHLIGHTS} 個）`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleComplete = async (id) => {
    await completeTask(id)
  }

  return (
    <section className={embedded ? 'space-y-3' : 'space-y-3'}>
      <div className="flex items-center gap-2">
        <Star size={18} className="text-warn" fill="currentColor" />
        <h2 className="text-sm font-semibold text-fg">Top 3 每日重點</h2>
        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted">
          {highlights?.length ?? 0}/{MAX_DAILY_HIGHLIGHTS}
        </span>
      </div>

      {message && (
        <p className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">{message}</p>
      )}

      {!highlights?.length ? (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted">
          從下方待辦點擊 ⭐ 設為今日重點
        </p>
      ) : (
        <ul className="space-y-2">
          {highlights.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-md border border-warn/20 bg-warn/5 p-3"
            >
              <button
                type="button"
                onClick={() => handleComplete(task.id)}
                className="mt-0.5 shrink-0 text-muted hover:text-success"
                aria-label="完成"
              >
                <Circle size={18} />
              </button>
              <div className="flex-1 space-y-1.5">
                <p className="text-sm font-medium leading-relaxed text-fg">{task.title}</p>
                <PriorityBadge priority={task.priority} />
              </div>
              <button
                type="button"
                onClick={() => handleToggleStar(task)}
                className="shrink-0 text-warn"
                aria-label="取消重點"
              >
                <Star size={16} fill="currentColor" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function HighlightStarButton({ task, onMaxReached }) {
  const handleClick = async () => {
    const result = await toggleDailyHighlight(task.id)
    if (result.error === 'max_reached') {
      onMaxReached?.()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`shrink-0 ${task.isDailyHighlight ? 'text-warn' : 'text-muted hover:text-warn'}`}
      aria-label={task.isDailyHighlight ? '取消重點' : '設為重點'}
    >
      <Star size={16} fill={task.isDailyHighlight ? 'currentColor' : 'none'} />
    </button>
  )
}
