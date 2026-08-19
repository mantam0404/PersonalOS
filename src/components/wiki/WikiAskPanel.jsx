import { HelpCircle, Send, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { chatWithNotes } from '../../services/ai'

export function WikiAskPanel() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)

  const notes = useLiveQuery(async () => {
    const [wiki, study] = await Promise.all([
      db.wikiNotes.toArray(),
      db.studyItems.toArray(),
    ])
    return [
      ...wiki.map((n) => ({ title: n.title, content: n.content, obsidianPath: n.obsidianPath })),
      ...study.map((s) => ({ title: s.title, content: s.content })),
    ]
  }, [])

  const handleAsk = async (e) => {
    e.preventDefault()
    const q = question.trim()
    if (!q) return

    setLoading(true)
    const result = await chatWithNotes(q, notes || [])
    setAnswer(result)
    setLoading(false)
  }

  return (
    <section className="bento-card space-y-4 p-5">
      <div className="flex items-center gap-2">
        <HelpCircle size={18} className="text-accent" />
        <h2 className="text-sm font-semibold text-fg">向筆記提問</h2>
        <span className="text-xs text-meta">RAG · Phase C</span>
      </div>

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：Personal OS 的捕捉流程是什麼？"
          className="input-field min-h-10 flex-1 px-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex min-h-10 min-w-10 items-center justify-center rounded-md bg-accent text-accent-on hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>

      {answer && (
        <div className="space-y-3 rounded-md border border-border bg-surface-elevated p-4">
          <p className="text-sm leading-relaxed text-fg whitespace-pre-wrap">{answer.answer}</p>
          {answer.citations?.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium text-meta">引用來源</p>
              <ul className="space-y-1">
                {answer.citations.map((c, i) => (
                  <li key={i} className="text-xs text-muted">
                    [{i + 1}] {c.title}
                    {c.snippet && <span className="block truncate opacity-70">{c.snippet}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[10px] text-meta">來源：{answer.source === 'llm' ? 'LLM' : '本地檢索'}</p>
        </div>
      )}
    </section>
  )
}
