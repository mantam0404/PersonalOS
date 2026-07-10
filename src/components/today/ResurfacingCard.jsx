import { useRef, useState } from 'react'
import { Sparkles, CheckCircle2 } from 'lucide-react'
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
        <Sparkles size={18} className="text-accent" />
        <h2 className="text-sm font-semibold text-fg">每日復現</h2>
        {highlightCount > 0 && (
          <span className="text-xs text-meta">從 {highlightCount} 條重點筆記抽選</span>
        )}
      </div>

      {!item ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-5 text-center">
          <p className="text-sm text-muted">尚無重點筆記 — 新增一條開始間歇複習</p>
          {isAdding ? (
            <form onSubmit={handleAddHighlight} className="mt-3 space-y-2">
              <textarea
                ref={inputRef}
                placeholder="輸入想記住的金句或知識點..."
                rows={3}
                autoFocus
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:shadow-focus"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-accent py-2 text-sm font-medium text-accent-on hover:bg-accent-hover"
              >
                加入重點庫
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-3 rounded-md border border-border px-4 py-2 text-sm text-fg-2 transition-colors hover:bg-surface-elevated"
            >
              + 新增重點筆記
            </button>
          )}
        </div>
      ) : (
        <div
          className={`rounded-md border p-4 ${
            isReviewed
              ? 'border-success/20 bg-success/5'
              : 'border-accent/20 bg-accent/5'
          }`}
        >
          {isReviewed && (
            <div className="mb-2 flex items-center gap-1 text-xs text-success">
              <CheckCircle2 size={14} />
              今日已複習
            </div>
          )}
          <p className="text-sm font-medium text-fg">
            {item.title || '重點筆記'}
          </p>
          {item.content && (
            <p className="mt-2 text-sm leading-relaxed text-fg-2">{item.content}</p>
          )}
          {!isReviewed && (
            <button
              type="button"
              onClick={handleReviewed}
              className="mt-3 w-full rounded-md bg-accent py-2 text-sm font-medium text-accent-on hover:bg-accent-hover"
            >
              標記已複習
            </button>
          )}
        </div>
      )}
    </section>
  )
}
