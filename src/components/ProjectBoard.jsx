import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Plus, ChevronRight } from 'lucide-react'
import { useProjectsByDomain, useDomains, useAllTasks } from '../hooks/useIndexedDB'
import { addProject } from '../db'
import { PriorityBadge } from './ui/Badge'

const inputClass = 'input-field min-h-10 w-full px-3 text-sm'
const selectClass = 'select-field w-full px-3 py-2 text-sm'

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
          <FolderKanban size={20} className="text-accent" />
          <h2 className="text-sm font-semibold text-fg">專案 Projects</h2>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="btn-ghost flex min-h-9 items-center gap-1 px-3 text-xs font-medium"
        >
          <Plus size={14} />
          新增專案
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddProject} className="bento-card space-y-2 p-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="專案名稱..."
            autoFocus
            className={inputClass}
          />
          <select
            value={selectedDomainId}
            onChange={(e) => setSelectedDomainId(e.target.value)}
            className={selectClass}
          >
            {domains?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full rounded-md bg-accent py-2.5 text-sm font-medium text-accent-on hover:bg-accent-hover"
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
            <h3 className="text-sm font-medium text-fg-2">{domain.name}</h3>
            <span className="text-xs text-meta">{projects.length} 專案</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {projects.length === 0 ? (
              <div className="w-full rounded-md border border-dashed border-border p-4 text-center text-xs text-muted">
                此領域尚無專案
              </div>
            ) : (
              projects.map((project) => {
                const tasks = getProjectTasks(project.id)
                return (
                  <div
                    key={project.id}
                    className="w-64 shrink-0 bento-card overflow-hidden"
                  >
                    <Link
                      to={`/domains/project/${project.id}`}
                      className="block border-b border-border px-3 py-2 transition-colors hover:bg-surface-elevated"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-fg">{project.name}</h4>
                        <ChevronRight size={14} className="text-meta" />
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-meta">{tasks.length} 項任務</span>
                        <span className="text-xs text-accent">{project.progress ?? 0}%</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border-soft">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${project.progress ?? 0}%` }}
                        />
                      </div>
                    </Link>
                    <ul className="space-y-2 p-2">
                      {tasks.length === 0 ? (
                        <li className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted">
                          尚無任務
                        </li>
                      ) : (
                        tasks.slice(0, 3).map((task) => (
                          <li
                            key={task.id}
                            className="rounded-md border border-border bg-surface-elevated p-2.5 text-sm"
                          >
                            <p className="mb-1.5 leading-snug text-fg">{task.title}</p>
                            <PriorityBadge priority={task.priority} />
                          </li>
                        ))
                      )}
                      {tasks.length > 3 && (
                        <li className="text-center text-xs text-meta">
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
