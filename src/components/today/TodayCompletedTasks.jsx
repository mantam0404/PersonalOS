import { CheckCircle2, RotateCcw } from 'lucide-react'
import { useTasks } from '../../hooks/useIndexedDB'
import { reopenTask } from '../../db'

export function TodayCompletedTasks() {
  const tasks = useTasks('done')

  if (!tasks?.length) return null

  const recent = tasks.slice(0, 10)

  return (
    <details className="rounded-xl border border-slate-800 bg-slate-900">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-400">
        已完成 ({tasks.length})
      </summary>
      <ul className="space-y-1 border-t border-slate-800 px-4 py-3">
        {recent.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="shrink-0 text-green-500" />
            <span className="flex-1 text-slate-500 line-through">{task.title}</span>
            <button
              type="button"
              onClick={() => reopenTask(task.id)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-800 hover:text-blue-400"
            >
              <RotateCcw size={12} />
              還原
            </button>
          </li>
        ))}
        {tasks.length > 10 && (
          <li className="text-center text-xs text-slate-600">還有 {tasks.length - 10} 項</li>
        )}
      </ul>
    </details>
  )
}
