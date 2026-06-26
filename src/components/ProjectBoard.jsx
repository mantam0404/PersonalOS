import { useRef, useState } from 'react'
import { FolderKanban, Plus } from 'lucide-react'
import { useProjects, useAllTasks } from '../hooks/useIndexedDB'
import { addProject } from '../db'
import { PriorityBadge } from './ui/Badge'

export function ProjectBoard() {
  const projects = useProjects()
  const allTasks = useAllTasks()
  const inputRef = useRef(null)
  const [isAdding, setIsAdding] = useState(false)

  const todoTasks = allTasks?.filter((t) => t.status === 'todo') || []

  const unassigned = todoTasks.filter((t) => !t.projectId)

  const getProjectTasks = (projectId) =>
    todoTasks.filter((t) => t.projectId === projectId)

  const handleAddProject = async (e) => {
    e.preventDefault()
    const name = inputRef.current?.value?.trim()
    if (!name) return
    await addProject(name)
    inputRef.current.value = ''
    setIsAdding(false)
  }

  const columns = [
    { id: null, name: '未分類', tasks: unassigned },
    ...(projects || []).map((p) => ({
      id: p.id,
      name: p.name,
      tasks: getProjectTasks(p.id),
    })),
  ]

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderKanban size={20} className="text-purple-500" />
          <h2 className="text-lg font-semibold">專案</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding((v) => !v)}
          className="flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
        >
          <Plus size={14} />
          新增專案
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddProject} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="專案名稱..."
            autoFocus
            className="min-h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
          <button
            type="submit"
            className="rounded-lg bg-purple-600 px-4 text-sm font-medium text-white hover:bg-purple-700"
          >
            建立
          </button>
        </form>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div
            key={col.id ?? 'unassigned'}
            className="w-64 shrink-0 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
              <h3 className="text-sm font-medium">{col.name}</h3>
              <span className="text-xs text-slate-500">{col.tasks.length} 項</span>
            </div>
            <ul className="space-y-2 p-2">
              {col.tasks.length === 0 ? (
                <li className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 dark:border-slate-600">
                  尚無任務
                </li>
              ) : (
                col.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-800"
                  >
                    <p className="mb-1.5 leading-snug">{task.title}</p>
                    <PriorityBadge priority={task.priority} />
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
