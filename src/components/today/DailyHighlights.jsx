import { useState } from 'react'
import { Star, Circle, CheckCircle2 } from 'lucide-react'
import { useDailyHighlights } from '../../hooks/useToday'
import { toggleDailyHighlight, completeTask } from '../../db'
import { PriorityBadge } from '../ui/Badge'
import { MAX_DAILY_HIGHLIGHTS } from '../../db/helpers'

export function DailyHighlights() {
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
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Star size={20} className="text-amber-400" fill="currentColor" />
        <h2 className="text-lg font-semibold">Top 3 每日重點</h2>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
          {highlights?.length ?? 0}/{MAX_DAILY_HIGHLIGHTS}
        </span>
      </div>

      {message && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">{message}</p>
      )}

      {!highlights?.length ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-500">
          從下方待辦點擊 ⭐ 設為今日重點
        </p>
      ) : (
        <ul className="space-y-2">
          {highlights.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"
            >
              <button
                type="button"
                onClick={() => handleComplete(task.id)}
                className="mt-0.5 shrink-0 text-slate-500 hover:text-green-400"
                aria-label="完成"
              >
                <Circle size={20} />
              </button>
              <div className="flex-1 space-y-1.5">
                <p className="text-sm font-medium leading-relaxed">{task.title}</p>
                <PriorityBadge priority={task.priority} />
              </div>
              <button
                type="button"
                onClick={() => handleToggleStar(task)}
                className="shrink-0 text-amber-400"
                aria-label="取消重點"
              >
                <Star size={18} fill="currentColor" />
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
      className={`shrink-0 ${task.isDailyHighlight ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
      aria-label={task.isDailyHighlight ? '取消重點' : '設為重點'}
    >
      <Star size={16} fill={task.isDailyHighlight ? 'currentColor' : 'none'} />
    </button>
  )
}
