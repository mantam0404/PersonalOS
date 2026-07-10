import { useRef, useState } from 'react'
import { RefreshCw, Plus, Flame } from 'lucide-react'
import { useRoutines } from '../../hooks/useToday'
import { useDomains } from '../../hooks/useIndexedDB'
import { addRoutine, completeRoutine, deleteRoutine, isRoutineDoneToday } from '../../db'
import { StreakBarChart } from './StreakBarChart'

export function RoutineList() {
  const routines = useRoutines()
  const domains = useDomains()
  const inputRef = useRef(null)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedDomainId, setSelectedDomainId] = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    const title = inputRef.current?.value?.trim()
    if (!title) return
    await addRoutine(title, selectedDomainId || domains?.[0]?.id)
    inputRef.current.value = ''
    setIsAdding(false)
  }

  const handleComplete = async (id) => {
    await completeRoutine(id)
  }

  const handleDelete = async (id) => {
    await deleteRoutine(id)
  }

  const openAdd = () => {
    setSelectedDomainId(domains?.[0]?.id || '')
    setIsAdding(true)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="text-success" />
          <h2 className="text-sm font-semibold text-fg">常規習慣</h2>
          {routines && (
            <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted">
              {routines.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex min-h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-elevated"
        >
          <Plus size={14} />
          新增
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="space-y-2 rounded-md border border-border bg-surface-elevated p-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="如：吃維他命、每日背單字..."
            autoFocus
            className="min-h-9 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none focus:shadow-focus"
          />
          <select
            value={selectedDomainId}
            onChange={(e) => setSelectedDomainId(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg"
          >
            {domains?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full rounded-md bg-success py-2 text-sm font-medium text-white hover:opacity-90"
          >
            建立習慣
          </button>
        </form>
      )}

      {!routines?.length ? (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted">
          建立每日習慣，追蹤連續天數
        </p>
      ) : (
        <ul className="space-y-2">
          {routines.map((routine) => {
            const doneToday = isRoutineDoneToday(routine)
            return (
              <li
                key={routine.id}
                className={`flex items-center gap-3 rounded-md border p-3 ${
                  doneToday
                    ? 'border-success/20 bg-success/5'
                    : 'border-border bg-surface-elevated'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleComplete(routine.id)}
                  disabled={doneToday}
                  className={`flex min-h-9 min-w-9 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                    doneToday
                      ? 'bg-success/15 text-success'
                      : 'border border-border text-muted hover:border-success hover:text-success'
                  }`}
                >
                  {doneToday ? '✓' : '完成'}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`truncate text-sm ${doneToday ? 'text-muted line-through' : 'text-fg'}`}>
                    {routine.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-warn">
                    <Flame size={12} />
                    <span>{routine.streak || 0} 天連續</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(routine.id)}
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-danger"
                >
                  刪除
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <StreakBarChart routines={routines} />
    </section>
  )
}
