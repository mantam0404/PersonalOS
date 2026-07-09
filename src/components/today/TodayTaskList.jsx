import { useState } from 'react'
import { ListTodo, Circle } from 'lucide-react'
import { useTodayTasks } from '../../hooks/useToday'
import { completeTask } from '../../db'
import { PriorityBadge } from '../ui/Badge'
import { HighlightStarButton } from './DailyHighlights'
import { MAX_DAILY_HIGHLIGHTS } from '../../db/helpers'

export function TodayTaskList() {
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
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ListTodo size={20} className="text-blue-400" />
        <h2 className="text-lg font-semibold">今日待辦</h2>
        {tasks && (
          <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400">
            {tasks.length}
          </span>
        )}
      </div>

      {message && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">{message}</p>
      )}

      {!tasks?.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center text-sm text-slate-500">
          沒有待辦 — 從捕捉頁轉化一條記錄
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
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
                <p className="text-sm leading-relaxed">{task.title}</p>
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
