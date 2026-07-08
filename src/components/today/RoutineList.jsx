import { useRef, useState } from 'react'
import { RefreshCw, Plus, Flame } from 'lucide-react'
import { useRoutines } from '../../hooks/useToday'
import { useDomains } from '../../hooks/useIndexedDB'
import { addRoutine, completeRoutine, deleteRoutine, isRoutineDoneToday } from '../../db'

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
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RefreshCw size={20} className="text-green-400" />
          <h2 className="text-lg font-semibold">常規習慣</h2>
          {routines && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {routines.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex min-h-9 items-center gap-1 rounded-lg border border-slate-700 px-3 text-xs font-medium text-slate-300 hover:bg-slate-800"
        >
          <Plus size={14} />
          新增
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="如：吃維他命、每日背單字..."
            autoFocus
            className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 outline-none focus:border-blue-500"
          />
          <select
            value={selectedDomainId}
            onChange={(e) => setSelectedDomainId(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          >
            {domains?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            建立習慣
          </button>
        </form>
      )}

      {!routines?.length ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-500">
          建立每日習慣，追蹤連續天數
        </p>
      ) : (
        <ul className="space-y-2">
          {routines.map((routine) => {
            const doneToday = isRoutineDoneToday(routine)
            return (
              <li
                key={routine.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  doneToday
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleComplete(routine.id)}
                  disabled={doneToday}
                  className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    doneToday
                      ? 'bg-green-600/20 text-green-400'
                      : 'border border-slate-700 text-slate-400 hover:border-green-500 hover:text-green-400'
                  }`}
                >
                  {doneToday ? '✓' : '完成'}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${doneToday ? 'text-slate-400 line-through' : ''}`}>
                    {routine.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-orange-400">
                    <Flame size={12} />
                    <span>{routine.streak || 0} 天連續</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(routine.id)}
                  className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-800 hover:text-red-400"
                >
                  刪除
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
