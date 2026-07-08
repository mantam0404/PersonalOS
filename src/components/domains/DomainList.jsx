import { useRef, useState } from 'react'
import { Layers, Plus, Trash2, Pencil } from 'lucide-react'
import { useDomains } from '../../hooks/useIndexedDB'
import { addDomain, updateDomain, deleteDomain } from '../../db'

const PRESET_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#64748b']

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
          <Layers size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold">領域 Domains</h2>
          {domains && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
              {domains.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsAdding((v) => !v)}
          className="flex min-h-9 items-center gap-1 rounded-lg border border-slate-700 px-3 text-xs font-medium text-slate-300 hover:bg-slate-800"
        >
          <Plus size={14} />
          新增領域
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="領域名稱，如：工作、日文學習..."
            autoFocus
            className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`h-7 w-7 rounded-full transition-transform ${
                  selectedColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                }`}
                style={{ backgroundColor: color }}
                aria-label={`選擇顏色 ${color}`}
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            建立領域
          </button>
        </form>
      )}

      {!domains?.length ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
          載入中...
        </p>
      ) : (
        <ul className="space-y-2">
          {domains.map((domain) => (
            <li
              key={domain.id}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3"
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
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-sm outline-none focus:border-blue-500"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-medium">{domain.name}</span>
              )}
              <div className="flex gap-1">
                {editingId === domain.id ? (
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(domain.id)}
                    className="rounded-lg px-2 py-1 text-xs text-blue-400 hover:bg-slate-800"
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
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                    aria-label="編輯"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {domains.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDelete(domain.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400"
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
