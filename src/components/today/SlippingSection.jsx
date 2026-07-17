import { AlertTriangle } from 'lucide-react'
import { useSlippingItems } from '../../hooks/useToday'
import { useSlippingDaysThreshold } from '../../hooks/usePhaseFeatures'
import { handleSlippingToday } from '../../db'
import { daysSince } from '../../db/helpers'

const TYPE_LABELS = {
  task: '任務',
  project: '專案',
  study: '筆記',
}

export function SlippingSection({ alwaysShow = false }) {
  const items = useSlippingItems()
  const slippingDays = useSlippingDaysThreshold()

  const handleToday = async (item) => {
    await handleSlippingToday(item.type, item.id)
  }

  if (!items?.length && !alwaysShow) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} className="text-warn" />
        <h2 className="text-sm font-semibold text-fg">滑落提醒</h2>
        {items?.length > 0 && (
          <span className="rounded-full bg-warn/10 px-2 py-0.5 text-xs text-warn">
            {items.length}
          </span>
        )}
      </div>

      <p className="text-xs text-meta">超過 {slippingDays ?? 5} 天未更新的項目</p>

      {!items?.length ? (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted">
          沒有滑落項目 — 保持得很好
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              className="flex items-center gap-2 rounded-md border border-warn/20 bg-warn/5 p-2.5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted">
                    {TYPE_LABELS[item.type]}
                  </span>
                  <p className="truncate text-sm text-fg">{item.title}</p>
                </div>
                <p className="mt-1 text-xs text-warn/80">
                  已 {daysSince(item.lastTouchedAt)} 天未更新
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToday(item)}
                className="shrink-0 rounded-md bg-warn px-2.5 py-1.5 text-xs font-medium text-bg hover:opacity-90"
              >
                今日處理
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
