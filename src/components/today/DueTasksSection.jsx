import { Clock, AlertCircle } from 'lucide-react'
import { useDueTasks } from '../../hooks/usePhaseFeatures'
import { completeTask } from '../../db'

function formatDueDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

export function DueTasksSection() {
  const tasks = useDueTasks()

  const handleComplete = async (id) => {
    await completeTask(id)
  }

  if (!tasks?.length) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-warn" />
        <h2 className="text-sm font-semibold text-fg">到期待辦</h2>
        <span className="rounded-full bg-warn/10 px-2 py-0.5 text-xs text-warn">
          {tasks.length}
        </span>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex items-center gap-2 rounded-md border p-2.5 ${
              task.isOverdue ? 'border-danger/30 bg-danger/5' : 'border-warn/20 bg-warn/5'
            }`}
          >
            {task.isOverdue && <AlertCircle size={16} className="shrink-0 text-danger" />}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-fg">{task.title}</p>
              <p className={`text-xs ${task.isOverdue ? 'text-danger' : 'text-warn/80'}`}>
                {task.isOverdue ? '已逾期 · ' : '今日到期 · '}
                {formatDueDate(task.dueDate)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleComplete(task.id)}
              className="shrink-0 rounded-md bg-surface px-2 py-1 text-xs text-muted hover:text-success"
            >
              完成
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
