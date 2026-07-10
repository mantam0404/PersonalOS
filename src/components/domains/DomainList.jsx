import { useRef, useState } from 'react'
import { Layers, Plus, Trash2, Pencil } from 'lucide-react'
import { useDomains } from '../../hooks/useIndexedDB'
import { addDomain, updateDomain, deleteDomain } from '../../db'

const PRESET_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#64748b']

const inputClass = 'input-field min-h-10 w-full px-3 text-sm'

export function DomainList() {
  const domains = useDomains()
  const inputRef = useRef(null)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    const name = inputRef.current?.value?.trim()
    if (!name) return
    await addDomain(name, selectedColor)
    inputRef.current.value = ''
    setIsAdding(false)
  }

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return
    await updateDomain(id, { name: editName.trim() })
    setEditingId(null)
    setEditName('')
  }

  const handleDelete = async (id) => {
    if (domains?.length <= 1) return
    await deleteDomain(id)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-accent" />
          <h2 className="text-sm font-semibold text-fg">領域 Domains</h2>
          {domains && (
            <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted">
              {domains.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsAdding((v) => !v)}
          className="btn-ghost flex min-h-9 items-center gap-1 px-3 text-xs font-medium"
        >
          <Plus size={14} />
          新增領域
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bento-card space-y-3 p-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="領域名稱，如：工作、日文學習..."
            autoFocus
            className={inputClass}
          />
          <div className="flex gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`h-7 w-7 rounded-full transition-transform ${
                  selectedColor === color ? 'scale-110 ring-2 ring-fg ring-offset-2 ring-offset-bg' : ''
                }`}
                style={{ backgroundColor: color }}
                aria-label={`選擇顏色 ${color}`}
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-accent py-2.5 text-sm font-medium text-accent-on hover:bg-accent-hover"
          >
            建立領域
          </button>
        </form>
      )}

      {!domains?.length ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
          載入中...
        </p>
      ) : (
        <ul className="space-y-2">
          {domains.map((domain) => (
            <li
              key={domain.id}
              className="bento-card flex items-center gap-3 p-3"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: domain.color }}
              />
              {editingId === domain.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(domain.id)}
                  className="input-field flex-1 px-2 py-1 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-medium text-fg">{domain.name}</span>
              )}
              <div className="flex gap-1">
                {editingId === domain.id ? (
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(domain.id)}
                    className="rounded-md px-2 py-1 text-xs text-accent hover:bg-surface"
                  >
                    儲存
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(domain.id)
                      setEditName(domain.name)
                    }}
                    className="rounded-md p-2 text-muted hover:bg-surface hover:text-fg"
                    aria-label="編輯"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {domains.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDelete(domain.id)}
                    className="rounded-md p-2 text-muted hover:bg-surface hover:text-danger"
                    aria-label="刪除"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
