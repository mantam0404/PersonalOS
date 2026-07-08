import { AlertTriangle } from 'lucide-react'
import { useSlippingItems } from '../../hooks/useToday'
import { handleSlippingToday } from '../../db'
import { daysSince } from '../../db/helpers'

const TYPE_LABELS = {
  task: '任務',
  project: '專案',
  study: '筆記',
}

export function SlippingSection() {
  const items = useSlippingItems()

  const handleToday = async (item) => {
    await handleSlippingToday(item.type, item.id)
  }

  if (!items?.length) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={20} className="text-amber-500" />
        <h2 className="text-lg font-semibold">滑落提醒</h2>
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
          {items.length}
        </span>
      </div>

      <p className="text-xs text-slate-500">以下項目超過 5 天未更新，可能被遺忘了</p>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={`${item.type}-${item.id}`}
            className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400">
                  {TYPE_LABELS[item.type]}
                </span>
                <p className="text-sm">{item.title}</p>
              </div>
              <p className="mt-1 text-xs text-amber-400/80">
                已 {daysSince(item.lastTouchedAt)} 天未更新
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToday(item)}
              className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              今日處理
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
