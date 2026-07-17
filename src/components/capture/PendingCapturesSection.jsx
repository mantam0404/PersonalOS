import { useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { usePendingCaptures } from '../../hooks/usePhaseFeatures'
import { resolvePendingCapture } from '../../db'
import { executeAction } from '../../services/actionExecutor'

export function PendingCapturesSection() {
  const pending = usePendingCaptures()
  const [resolving, setResolving] = useState(null)

  if (!pending?.length) return null

  const handleResolve = async (item, choice) => {
    setResolving(item.id)
    const action = { ...item.parsedIntent }

    if (item.candidates?.tasks && choice) {
      action.type = 'complete_task'
      action.title = choice.title
    } else if (item.candidates?.projects && choice) {
      action.projectId = choice.id
      action.projectName = choice.name
    }

    await executeAction(action)
    await resolvePendingCapture(item.id)
    setResolving(null)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle size={18} className="text-warn" />
        <h2 className="text-sm font-semibold text-fg">待確認語音指令</h2>
        <span className="rounded-full bg-warn/10 px-2 py-0.5 text-xs text-warn">
          {pending.length}
        </span>
      </div>

      <ul className="space-y-3">
        {pending.map((item) => {
          const taskCandidates = item.candidates?.tasks
          const projectCandidates = item.candidates?.projects
          const candidates = taskCandidates || projectCandidates

          return (
            <li key={item.id} className="rounded-md border border-warn/20 bg-warn/5 p-3">
              <p className="text-sm text-fg">{item.rawTranscript}</p>
              <p className="mt-1 text-xs text-meta">
                {item.parsedIntent?.type} · {new Date(item.capturedAt).toLocaleString('zh-TW')}
              </p>

              {candidates?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {candidates.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        disabled={resolving === item.id}
                        onClick={() => handleResolve(item, c)}
                        className="flex w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-left text-sm hover:border-accent"
                      >
                        <Check size={14} className="shrink-0 text-accent" />
                        {c.title || c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
