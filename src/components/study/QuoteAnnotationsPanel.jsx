import { useState } from 'react'
import { MessageSquarePlus, Trash2 } from 'lucide-react'
import { useQuoteAnnotations } from '../../hooks/usePhaseFeatures'
import { addQuoteAnnotation, deleteQuoteAnnotation } from '../../db'

export function QuoteAnnotationsPanel({ studyId, selectedText }) {
  const annotations = useQuoteAnnotations(studyId)
  const [note, setNote] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    const quote = selectedText?.trim()
    if (!quote) return
    setAdding(true)
    await addQuoteAnnotation({ studyId, quoteText: quote, annotation: note.trim() })
    setNote('')
    setAdding(false)
  }

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-1 text-sm font-medium text-muted">
        <MessageSquarePlus size={14} />
        金句註解
      </h3>

      {selectedText && (
        <form onSubmit={handleAdd} className="space-y-2 rounded-md border border-accent/30 bg-accent/5 p-3">
          <p className="text-xs text-fg">「{selectedText.slice(0, 120)}{selectedText.length > 120 ? '…' : ''}」</p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="加入你的註解..."
            className="input-field w-full px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-md bg-accent px-3 py-1.5 text-xs text-accent-on hover:bg-accent-hover"
          >
            儲存註解
          </button>
        </form>
      )}

      {!annotations?.length ? (
        <p className="text-xs text-meta">選取文字後可加入註解</p>
      ) : (
        <ul className="space-y-2">
          {annotations.map((a) => (
            <li key={a.id} className="rounded-md border border-border bg-surface-elevated p-3">
              <blockquote className="text-sm italic text-fg">「{a.quoteText}」</blockquote>
              {a.annotation && <p className="mt-2 text-xs text-muted">{a.annotation}</p>}
              <button
                type="button"
                onClick={() => deleteQuoteAnnotation(a.id)}
                className="mt-2 flex items-center gap-1 text-xs text-danger hover:underline"
              >
                <Trash2 size={12} />
                刪除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
