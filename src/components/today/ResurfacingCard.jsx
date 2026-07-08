import { useRef, useState } from 'react'
import { RefreshCw, CheckCircle2 } from 'lucide-react'
import { useResurfacing, useHighlightStudyCount } from '../../hooks/useToday'
import { markResurfacingReviewed, touchStudyItem, addStudyHighlight } from '../../db'

export function ResurfacingCard() {
  const resurfacing = useResurfacing()
  const highlightCount = useHighlightStudyCount()
  const inputRef = useRef(null)
  const [isAdding, setIsAdding] = useState(false)
  const [reviewed, setReviewed] = useState(false)

  const handleReviewed = async () => {
    if (!resurfacing?.item) return
    markResurfacingReviewed(resurfacing.reviewedKey, resurfacing.item.id)
    await touchStudyItem(resurfacing.item.id)
    setReviewed(true)
  }

  const handleAddHighlight = async (e) => {
    e.preventDefault()
    const text = inputRef.current?.value?.trim()
    if (!text) return
    await addStudyHighlight(text.slice(0, 40), text)
    inputRef.current.value = ''
    setIsAdding(false)
  }

  if (resurfacing === undefined) return null

  const isReviewed = reviewed || resurfacing?.isReviewed
  const item = resurfacing?.item

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <RefreshCw size={20} className="text-purple-400" />
        <h2 className="text-lg font-semibold">每日復現</h2>
      </div>

      {!item ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-5 text-center">
          <p className="text-sm text-slate-500">尚無重點筆記 — 新增一條開始間歇複習</p>
          {isAdding ? (
            <form onSubmit={handleAddHighlight} className="mt-3 space-y-2">
              <textarea
                ref={inputRef}
                placeholder="輸入想記住的金句或知識點..."
                rows={3}
                autoFocus
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                加入重點庫
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-3 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              + 新增重點筆記
            </button>
          )}
        </div>
      ) : (
        <div
          className={`rounded-xl border p-4 ${
            isReviewed
              ? 'border-green-500/20 bg-green-500/5'
              : 'border-purple-500/20 bg-purple-500/5'
          }`}
        >
          {isReviewed && (
            <div className="mb-2 flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 size={14} />
              今日已複習
            </div>
          )}
          <p className="text-sm font-medium text-slate-200">
            {item.title || '重點筆記'}
          </p>
          {item.content && (
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.content}</p>
          )}
          {!isReviewed && (
            <button
              type="button"
              onClick={handleReviewed}
              className="mt-3 w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              標記已複習
            </button>
          )}
          {highlightCount > 1 && (
            <p className="mt-2 text-center text-xs text-slate-500">
              從 {highlightCount} 條重點筆記中每日抽選
            </p>
          )}
        </div>
      )}
    </section>
  )
}
