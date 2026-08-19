import { Layers } from 'lucide-react'
import { useDomainStatus } from '../../hooks/usePhaseFeatures'

export function DomainStatusCard() {
  const statuses = useDomainStatus()

  if (!statuses?.length) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers size={18} className="text-accent" />
        <h2 className="text-sm font-semibold text-fg">領域概況</h2>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {statuses.map(({ domain, activeTasks, activeProjects, slippingCount }) => (
          <div
            key={domain.id}
            className="rounded-md border border-border bg-surface-elevated p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: domain.color }}
              />
              <span className="truncate text-sm font-medium text-fg">{domain.name}</span>
            </div>
            <div className="mt-2 flex gap-3 text-xs text-muted">
              <span>{activeTasks} 待辦</span>
              <span>{activeProjects} 專案</span>
              {slippingCount > 0 && (
                <span className="text-warn">{slippingCount} 滑落</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
