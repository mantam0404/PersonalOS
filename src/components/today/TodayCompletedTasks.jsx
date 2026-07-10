import { CheckCircle2, RotateCcw } from 'lucide-react'
import { useTasks } from '../../hooks/useIndexedDB'
import { reopenTask } from '../../db'

export function TodayCompletedTasks({ embedded = false }) {
  const tasks = useTasks('done')

  if (!tasks?.length) return null

  const recent = tasks.slice(0, 10)

  return (
    <details className={`${embedded ? 'border-t border-border pt-4' : ''}`}>
      <summary className="cursor-pointer text-sm font-medium text-muted hover:text-fg">
        已完成 ({tasks.length})
      </summary>
      <ul className="mt-2 space-y-1">
        {recent.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="shrink-0 text-success" />
            <span className="flex-1 text-muted line-through">{task.title}</span>
            <button
              type="button"
              onClick={() => reopenTask(task.id)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-accent"
            >
              <RotateCcw size={12} />
              還原
            </button>
          </li>
        ))}
        {tasks.length > 10 && (
          <li className="text-center text-xs text-meta">還有 {tasks.length - 10} 項</li>
        )}
      </ul>
    </details>
  )
}
