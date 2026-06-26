import { useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { addInboxItem } from '../db'

export function QuickCaptureInput() {
  const inputRef = useRef(null)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const text = inputRef.current?.value?.trim()
    if (!text) return

    inputRef.current.value = ''
    await addInboxItem(text)
    inputRef.current?.focus()
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 sm:sticky sm:top-14 sm:border-b sm:border-t-0"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-3xl gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="閃電輸入 — 2 秒捕捉想法..."
          autoComplete="off"
          enterKeyHint="done"
          className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:focus:border-blue-400"
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
