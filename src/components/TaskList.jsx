import { useState, useMemo } from 'react'
import { CheckCircle2, Circle, ListTodo } from 'lucide-react'
import { useTasks } from '../hooks/useIndexedDB'
import { completeTask, TASK_CONTEXT, TASK_PRIORITY } from '../db'
import { PriorityBadge, ContextBadge } from './ui/Badge'

export function TaskList() {
  const tasks = useTasks('todo')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [contextFilter, setContextFilter] = useState('all')

  const filtered = useMemo(() => {
    if (!tasks) return []
    return tasks.filter((t) => {
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (contextFilter !== 'all' && t.context !== contextFilter) return false
      return true
    })
  }, [tasks, priorityFilter, contextFilter])

  const handleComplete = async (id) => {
    await completeTask(id)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ListTodo size={20} className="text-green-500" />
        <h2 className="text-lg font-semibold">待辦</h2>
        {filtered && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium dark:bg-slate-700">
            {filtered.length}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="all">全部優先級</option>
          <option value={TASK_PRIORITY.HIGH}>高</option>
          <option value={TASK_PRIORITY.MEDIUM}>中</option>
          <option value={TASK_PRIORITY.LOW}>低</option>
        </select>
        <select
          value={contextFilter}
          onChange={(e) => setContextFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="all">全部情境</option>
          <option value={TASK_CONTEXT.WORK}>Work</option>
          <option value={TASK_CONTEXT.LIFE}>Life</option>
          <option value={TASK_CONTEXT.ON_THE_GO}>On-the-go</option>
        </select>
      </div>

      {!filtered?.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600">
          沒有待辦事項 — 從收件匣轉化一條記錄
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <button
                type="button"
                onClick={() => handleComplete(task.id)}
                className="mt-0.5 shrink-0 text-slate-400 hover:text-green-500"
                aria-label="標記完成"
              >
                <Circle size={20} />
              </button>
              <div className="flex-1 space-y-1.5">
                <p className="text-sm leading-relaxed">{task.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  <PriorityBadge priority={task.priority} />
                  <ContextBadge context={task.context} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function CompletedTasks() {
  const tasks = useTasks('done')

  if (!tasks?.length) return null

  return (
    <details className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-500">
        已完成 ({tasks.length})
      </summary>
      <ul className="space-y-1 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-sm text-slate-500 line-through">
            <CheckCircle2 size={16} className="shrink-0 text-green-500" />
            {task.title}
          </li>
        ))}
      </ul>
    </details>
  )
}
