import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Plus, ChevronRight } from 'lucide-react'
import { useProjectsByDomain, useDomains, useAllTasks } from '../hooks/useIndexedDB'
import { addProject } from '../db'
import { PriorityBadge } from './ui/Badge'

export function ProjectBoard() {
  const grouped = useProjectsByDomain()
  const domains = useDomains()
  const allTasks = useAllTasks()
  const inputRef = useRef(null)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedDomainId, setSelectedDomainId] = useState('')

  const todoTasks = allTasks?.filter((t) => t.status === 'todo') || []

  const getProjectTasks = (projectId) =>
    todoTasks.filter((t) => t.projectId === projectId)

  const handleAddProject = async (e) => {
    e.preventDefault()
    const name = inputRef.current?.value?.trim()
    if (!name) return
    await addProject(name, { domainId: selectedDomainId || domains?.[0]?.id })
    inputRef.current.value = ''
    setIsAdding(false)
  }

  const openAddForm = () => {
    setSelectedDomainId(domains?.[0]?.id || '')
    setIsAdding(true)
  }

  if (!grouped) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderKanban size={20} className="text-purple-400" />
          <h2 className="text-lg font-semibold">專案 Projects</h2>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="flex min-h-9 items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <Plus size={14} />
          新增專案
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddProject} className="space-y-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="專案名稱..."
            autoFocus
            className="min-h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
          />
          <select
            value={selectedDomainId}
            onChange={(e) => setSelectedDomainId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          >
            {domains?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            建立
          </button>
        </form>
      )}

      {grouped.map(({ domain, projects }) => (
        <div key={domain.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: domain.color }}
            />
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{domain.name}</h3>
            <span className="text-xs text-slate-500">{projects.length} 專案</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {projects.length === 0 ? (
              <div className="w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-xs text-slate-500">
                此領域尚無專案
              </div>
            ) : (
              projects.map((project) => {
                const tasks = getProjectTasks(project.id)
                return (
                  <div
                    key={project.id}
                    className="w-64 shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50"
                  >
                    <Link
                      to={`/domains/project/${project.id}`}
                      className="block border-b border-slate-200 dark:border-slate-800 px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{project.name}</h4>
                        <ChevronRight size={14} className="text-slate-500" />
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-slate-500">{tasks.length} 項任務</span>
                        <span className="text-xs text-purple-400">{project.progress ?? 0}%</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${project.progress ?? 0}%` }}
                        />
                      </div>
                    </Link>
                    <ul className="space-y-2 p-2">
                      {tasks.length === 0 ? (
                        <li className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-xs text-slate-500">
                          尚無任務
                        </li>
                      ) : (
                        tasks.slice(0, 3).map((task) => (
                          <li
                            key={task.id}
                            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-sm"
                          >
                            <p className="mb-1.5 leading-snug">{task.title}</p>
                            <PriorityBadge priority={task.priority} />
                          </li>
                        ))
                      )}
                      {tasks.length > 3 && (
                        <li className="text-center text-xs text-slate-500">
                          +{tasks.length - 3} 更多
                        </li>
                      )}
                    </ul>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ))}
    </section>
  )
}
