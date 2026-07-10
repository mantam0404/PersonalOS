import { BentoCapture } from '../components/today/BentoCapture'
import { CalendarEvents } from '../components/today/CalendarEvents'
import { DailyHighlights } from '../components/today/DailyHighlights'
import { TodayTaskList } from '../components/today/TodayTaskList'
import { RoutineList } from '../components/today/RoutineList'
import { SlippingSection } from '../components/today/SlippingSection'
import { ResurfacingCard } from '../components/today/ResurfacingCard'
import { TodayCompletedTasks } from '../components/today/TodayCompletedTasks'
import { getTodayKey } from '../db/helpers'

export function TodayView() {
  const today = getTodayKey()

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">今日</h1>
        <p className="text-sm text-muted">
          {today} · 聚焦今天最重要的事
        </p>
      </header>

      <div className="bento-grid">
        <div className="bento-a">
          <BentoCapture />
        </div>

        <div className="bento-b bento-card flex flex-col gap-6 p-5">
          <DailyHighlights embedded />
          <div className="border-t border-border pt-5">
            <TodayTaskList embedded />
          </div>
          <TodayCompletedTasks embedded />
        </div>

        <div className="bento-c bento-card flex flex-col gap-5 p-5">
          <RoutineList />
          <div className="border-t border-border pt-5">
            <CalendarEvents />
          </div>
        </div>

        <div className="bento-d bento-card p-5">
          <SlippingSection alwaysShow />
        </div>

        <div className="bento-e bento-card p-5">
          <ResurfacingCard />
        </div>
      </div>
    </div>
  )
}
