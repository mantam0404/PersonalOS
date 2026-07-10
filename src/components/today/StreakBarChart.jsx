import { startOfDay, subDays, MS_PER_DAY } from '../../db/helpers'

function getLast7DaysCompletion(routine) {
  const today = startOfDay()
  const lastDone = routine.lastDoneAt ? startOfDay(routine.lastDoneAt) : null
  const streak = routine.streak || 0
  const streakStart = lastDone && streak > 0 ? lastDone - (streak - 1) * MS_PER_DAY : null

  return Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i)
    if (!streakStart || !lastDone) return false
    return day >= streakStart && day <= lastDone
  })
}

export function StreakBarChart({ routines }) {
  if (!routines?.length) return null

  const maxStreak = Math.max(...routines.map((r) => r.streak || 0), 1)

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wide text-meta">連續天數</h3>
        <span className="text-xs text-muted">近 7 日</span>
      </div>

      <div className="space-y-2.5">
        {routines.map((routine) => {
          const days = getLast7DaysCompletion(routine)
          const streak = routine.streak || 0
          const barWidth = Math.min(100, (streak / maxStreak) * 100)

          return (
            <div key={routine.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-fg-2">{routine.title}</span>
                <span className="shrink-0 text-xs font-medium text-warn">{streak}d</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-0.5">
                  {days.map((done, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-sm ${
                        done ? 'bg-success' : 'bg-border-soft'
                      }`}
                    />
                  ))}
                </div>
                <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-border-soft sm:block">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-base ease-standard"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
