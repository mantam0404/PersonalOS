import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useProject, useProjectMilestones } from '../../hooks/useStudy'
import { useDomains } from '../../hooks/useIndexedDB'
import {
  addMilestone,
  addChecklistItem,
  toggleChecklistItem,
  deleteMilestone,
  touchProject,
} from '../../db'

const inputClass = 'input-field min-h-10 flex-1 px-3 text-sm'

export function ProjectDetail({ projectId }) {
  const project = useProject(projectId)
  const milestones = useProjectMilestones(projectId)
  const domains = useDomains()
  const milestoneRef = useRef(null)
  const checklistRefs = useRef({})
  const [addingMilestone, setAddingMilestone] = useState(false)

  useEffect(() => {
    if (projectId) touchProject(projectId)
  }, [projectId])

  if (project === undefined || milestones === undefined) return null

  if (!project) {
    return (
      <div className="text-center text-muted">
        <p>專案不存在</p>
        <Link to="/domains" className="mt-2 text-accent">返回領域</Link>
      </div>
    )
  }

  const domain = domains?.find((d) => d.id === project.domainId)

  const handleAddMilestone = async (e) => {
    e.preventDefault()
    const title = milestoneRef.current?.value?.trim()
    if (!title) return
    await addMilestone(projectId, title)
    milestoneRef.current.value = ''
    setAddingMilestone(false)
  }

  const handleAddChecklist = async (milestoneId) => {
    const input = checklistRefs.current[milestoneId]
    const text = input?.value?.trim()
    if (!text) return
    await addChecklistItem(milestoneId, text)
    input.value = ''
  }

  return (
    <div className="space-y-6">
      <Link to="/domains" className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg">
        <ArrowLeft size={16} />
        返回領域
      </Link>

      <header>
        <h1 className="text-xl font-semibold text-fg">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-muted">{project.description}</p>
        )}
        <div className="mt-3 flex items-center gap-3">
          {domain && (
            <span
              className="rounded px-2 py-0.5 text-xs"
              style={{ backgroundColor: `${domain.color}22`, color: domain.color }}
            >
              {domain.name}
            </span>
          )}
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>完成進度</span>
              <span>{project.progress ?? 0}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border-soft">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${project.progress ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">里程碑</h2>
          <button
            type="button"
            onClick={() => setAddingMilestone(true)}
            className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs"
          >
            <Plus size={14} />
            新增
          </button>
        </div>

        {addingMilestone && (
          <form onSubmit={handleAddMilestone} className="flex gap-2">
            <input
              ref={milestoneRef}
              type="text"
              placeholder="里程碑名稱..."
              autoFocus
              className={inputClass}
            />
            <button type="submit" className="rounded-md bg-accent px-4 text-sm text-accent-on hover:bg-accent-hover">
              建立
            </button>
          </form>
        )}

        {!milestones?.length ? (
          <p className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted">
            新增里程碑與 Checklist 追蹤進度
          </p>
        ) : (
          milestones.map((m) => (
            <div key={m.id} className="bento-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-fg">{m.title}</h3>
                <button
                  type="button"
                  onClick={() => deleteMilestone(m.id)}
                  className="text-muted hover:text-danger"
                  aria-label="刪除里程碑"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <ul className="space-y-2">
                {m.checklist?.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="rounded"
                    />
                    <span className={`text-sm ${item.done ? 'text-muted line-through' : 'text-fg'}`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex gap-2">
                <input
                  ref={(el) => { checklistRefs.current[m.id] = el }}
                  type="text"
                  placeholder="新增 Checklist 項目..."
                  className="input-field min-h-9 flex-1 px-3 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklist(m.id))}
                />
                <button
                  type="button"
                  onClick={() => handleAddChecklist(m.id)}
                  className="btn-ghost px-3 text-xs"
                >
                  加入
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
