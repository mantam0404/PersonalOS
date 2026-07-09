import { useState } from 'react'
import { StudyList } from '../components/study/StudyList'
import { StudyEditor } from '../components/study/StudyEditor'
import { STUDY_TYPE } from '../db'

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: STUDY_TYPE.BOOK, label: '書籍' },
  { id: STUDY_TYPE.ARTICLE, label: '文章' },
  { id: STUDY_TYPE.NOTE, label: '筆記' },
  { id: STUDY_TYPE.QUOTE, label: '金句' },
  { id: STUDY_TYPE.HIGHLIGHT, label: '重點' },
]

export function StudyView() {
  const [filter, setFilter] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">學習</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">知識庫與筆記管理 — 支援 Markdown 與 #標籤</p>
      </header>

      <StudyEditor onCreated={() => setRefreshKey((k) => k + 1)} />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.id
                ? 'bg-green-600 text-white'
                : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <StudyList key={refreshKey} typeFilter={filter} />
    </div>
  )
}
