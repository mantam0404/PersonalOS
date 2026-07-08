import { CalendarDays, Star, RefreshCw, AlertTriangle } from 'lucide-react'

export function TodayView() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">今日</h1>
        <p className="text-sm text-slate-400">聚焦今天最重要的事</p>
      </header>

      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
        <RefreshCw size={24} className="mx-auto mb-2 text-purple-400" />
        <h2 className="font-medium">每日復現</h2>
        <p className="mt-1 text-sm text-slate-500">Sprint 2 — 從學習庫隨機抽選重點筆記</p>
      </section>

      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
        <Star size={24} className="mx-auto mb-2 text-amber-400" />
        <h2 className="font-medium">Top 3 每日重點</h2>
        <p className="mt-1 text-sm text-slate-500">Sprint 2 — 每天最多 3 個星號任務</p>
      </section>

      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
        <CalendarDays size={24} className="mx-auto mb-2 text-blue-400" />
        <h2 className="font-medium">今日待辦</h2>
        <p className="mt-1 text-sm text-slate-500">Sprint 2 — 顯示今日任務與習慣</p>
      </section>

      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
        <AlertTriangle size={24} className="mx-auto mb-2 text-amber-500" />
        <h2 className="font-medium">滑落提醒</h2>
        <p className="mt-1 text-sm text-slate-500">Sprint 2 — 超過 5 天未更新的項目</p>
      </section>
    </div>
  )
}
