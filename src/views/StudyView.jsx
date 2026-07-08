import { BookOpen } from 'lucide-react'

export function StudyView() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">學習</h1>
        <p className="text-sm text-slate-400">知識庫與筆記管理</p>
      </header>

      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
        <BookOpen size={32} className="mx-auto mb-3 text-green-400" />
        <h2 className="font-medium">Study Library</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sprint 3 — 書籍、文章、筆記、雙向連結
        </p>
      </section>
    </div>
  )
}
