import { useState } from 'react'
import { ListTodo, Circle } from 'lucide-react'
import { useTodayTasks } from '../../hooks/useToday'
import { completeTask } from '../../db'
import { PriorityBadge } from '../ui/Badge'
import { HighlightStarButton } from './DailyHighlights'
import { MAX_DAILY_HIGHLIGHTS } from '../../db/helpers'

export function TodayTaskList({ embedded = false }) {
  const tasks = useTodayTasks()
  const [message, setMessage] = useState('')

  const handleComplete = async (id) => {
    await completeTask(id)
  }

  const handleMaxReached = () => {
    setMessage(`今日重點已滿（最多 ${MAX_DAILY_HIGHLIGHTS} 個）`)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <section className={embedded ? 'space-y-3' : 'space-y-3'}>
      <div className="flex items-center gap-2">
        <ListTodo size={18} className="text-accent" />
        <h2 className="text-sm font-semibold text-fg">今日待辦</h2>
        {tasks && (
          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted">
            {tasks.length}
          </span>
        )}
      </div>

      {message && (
        <p className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">{message}</p>
      )}

      {!tasks?.length ? (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted">
          沒有待辦 — 從捕捉頁轉化一條記錄
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-md border border-border bg-surface-elevated p-3"
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
                <p className="text-sm leading-relaxed text-fg">{task.title}</p>
                <PriorityBadge priority={task.priority} />
              </div>
              <HighlightStarButton task={task} onMaxReached={handleMaxReached} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
