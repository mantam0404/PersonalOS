import { CalendarEvents } from '../components/today/CalendarEvents'
import { DailyHighlights } from '../components/today/DailyHighlights'
import { TodayTaskList } from '../components/today/TodayTaskList'
import { RoutineList } from '../components/today/RoutineList'
import { SlippingSection } from '../components/today/SlippingSection'
import { ResurfacingCard } from '../components/today/ResurfacingCard'
import { getTodayKey } from '../db/helpers'

export function TodayView() {
  const today = getTodayKey()

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">今日</h1>
        <p className="text-sm text-slate-400">
          {today} · 聚焦今天最重要的事
        </p>
      </header>

      <CalendarEvents />
      <ResurfacingCard />
      <DailyHighlights />
      <RoutineList />
      <TodayTaskList />
      <SlippingSection />
    </div>
  )
}
