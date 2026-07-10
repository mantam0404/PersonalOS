import { useState, useMemo } from 'react'
import { CheckCircle2, Circle, ListTodo } from 'lucide-react'
import { useTasks } from '../hooks/useIndexedDB'
import { completeTask, TASK_CONTEXT, TASK_PRIORITY } from '../db'
import { PriorityBadge, ContextBadge } from './ui/Badge'

const selectClass = 'select-field px-3 py-1.5 text-xs'

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
        <ListTodo size={20} className="text-success" />
        <h2 className="text-sm font-semibold text-fg">待辦</h2>
        {filtered && (
          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted">
            {filtered.length}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">全部優先級</option>
          <option value={TASK_PRIORITY.HIGH}>高</option>
          <option value={TASK_PRIORITY.MEDIUM}>中</option>
          <option value={TASK_PRIORITY.LOW}>低</option>
        </select>
        <select
          value={contextFilter}
          onChange={(e) => setContextFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">全部情境</option>
          <option value={TASK_CONTEXT.WORK}>Work</option>
          <option value={TASK_CONTEXT.LIFE}>Life</option>
          <option value={TASK_CONTEXT.ON_THE_GO}>On-the-go</option>
        </select>
      </div>

      {!filtered?.length ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
          沒有待辦事項 — 從收件匣轉化一條記錄
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((task) => (
            <li
              key={task.id}
              className="bento-card flex items-start gap-3 p-3"
            >
              <button
                type="button"
                onClick={() => handleComplete(task.id)}
                className="mt-0.5 shrink-0 text-muted hover:text-success"
                aria-label="標記完成"
              >
                <Circle size={20} />
              </button>
              <div className="flex-1 space-y-1.5">
                <p className="text-sm leading-relaxed text-fg">{task.title}</p>
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
    <details className="bento-card">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted">
        已完成 ({tasks.length})
      </summary>
      <ul className="space-y-1 border-t border-border px-4 py-3">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-sm text-muted line-through">
            <CheckCircle2 size={16} className="shrink-0 text-success" />
            {task.title}
          </li>
        ))}
      </ul>
    </details>
  )
}
