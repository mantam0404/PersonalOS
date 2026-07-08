import { useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { addInboxItem } from '../db'

export function QuickCaptureInput({ inline = false }) {
  const inputRef = useRef(null)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const text = inputRef.current?.value?.trim()
    if (!text) return

    inputRef.current.value = ''
    await addInboxItem(text)
    inputRef.current?.focus()
  }, [])

  const formClass = inline
    ? 'rounded-xl border border-slate-800 bg-slate-900 p-3'
    : 'fixed bottom-16 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md sm:sticky sm:top-14 sm:bottom-auto sm:border-b sm:border-t-0'

  return (
    <form
      onSubmit={handleSubmit}
      className={formClass}
      style={inline ? undefined : { paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-3xl gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="閃電輸入 — 2 秒捕捉想法..."
          autoComplete="off"
          enterKeyHint="done"
          className="min-h-11 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 text-base text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="submit"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
          aria-label="提交"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  )
}
