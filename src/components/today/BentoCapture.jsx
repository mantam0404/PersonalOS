import { useRef, useCallback, useState, useEffect } from 'react'
import { Search, Send, Mic, Loader2, Command } from 'lucide-react'
import { addInboxItem, CAPTURE_TYPE } from '../../db'
import { isSpeechRecognitionSupported, startVoiceCapture } from '../../services/voice'

export function BentoCapture() {
  const inputRef = useRef(null)
  const modalInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsModalOpen(true)
      }
      if (e.key === 'Escape') {
        setIsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isModalOpen) {
      requestAnimationFrame(() => modalInputRef.current?.focus())
    }
  }, [isModalOpen])

  const handleSubmit = useCallback(async (e, input) => {
    e?.preventDefault?.()
    const text = input?.value?.trim()
    if (!text) return

    input.value = ''
    await addInboxItem(text, CAPTURE_TYPE.TEXT)
    setIsModalOpen(false)
    input?.focus()
  }, [])

  const handleVoice = useCallback((input) => {
    if (isListening) {
      recognitionRef.current?.stop?.()
      recognitionRef.current = null
      setIsListening(false)
      return
    }
    setVoiceError('')

    if (!isSpeechRecognitionSupported()) {
      setVoiceError('此瀏覽器不支援語音輸入')
      return
    }

    setIsListening(true)
    const recognition = startVoiceCapture({
      onResult: async (transcript) => {
        if (input) input.value = transcript
        await addInboxItem(transcript, CAPTURE_TYPE.VOICE)
        setIsModalOpen(false)
      },
      onError: (err) => {
        setVoiceError(err.message)
        setIsListening(false)
      },
      onEnd: () => {
        setIsListening(false)
        recognitionRef.current = null
      },
    })
    if (!recognition) {
      setIsListening(false)
      return
    }
    recognitionRef.current = recognition
  }, [isListening])

  const captureInputClass =
    'w-full bg-transparent text-fg placeholder:text-muted outline-none text-sm'

  return (
    <>
      <div className="bento-card p-1">
        <form
          onSubmit={(e) => handleSubmit(e, inputRef.current)}
          className="flex items-center gap-2 px-3 py-2"
        >
          <Search size={16} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="text"
            placeholder="快速捕捉想法..."
            autoComplete="off"
            enterKeyHint="done"
            className={captureInputClass}
            onFocus={() => setIsModalOpen(false)}
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <kbd className="hidden items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-meta sm:inline-flex">
              <Command size={10} />
              K
            </kbd>
            <button
              type="button"
              onClick={() => handleVoice(inputRef.current)}
              disabled={isListening}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                isListening
                  ? 'bg-danger/10 text-danger'
                  : 'text-muted hover:bg-surface-elevated hover:text-fg'
              }`}
              aria-label="語音輸入"
            >
              {isListening ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
            </button>
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-on transition-colors hover:bg-accent-hover"
              aria-label="提交"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
        {(voiceError || isListening) && (
          <p className="px-3 pb-2 text-xs text-muted">
            {voiceError || '正在聆聽...'}
          </p>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-bg/80 px-4 pt-[20vh] backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bento-card w-full max-w-lg overflow-hidden shadow-raised"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={(e) => handleSubmit(e, modalInputRef.current)}
              className="flex items-center gap-3 border-b border-border px-4 py-3"
            >
              <Search size={18} className="shrink-0 text-muted" />
              <input
                ref={modalInputRef}
                type="text"
                placeholder="閃電輸入 — 2 秒捕捉想法..."
                autoComplete="off"
                className="flex-1 bg-transparent text-base text-fg placeholder:text-muted outline-none"
              />
              <button
                type="button"
                onClick={() => handleVoice(modalInputRef.current)}
                disabled={isListening}
                className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                  isListening
                    ? 'bg-danger/10 text-danger'
                    : 'text-muted hover:bg-surface-elevated hover:text-fg'
                }`}
                aria-label="語音輸入"
              >
                {isListening ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
              </button>
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-on hover:bg-accent-hover"
                aria-label="提交"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="flex items-center justify-between px-4 py-2.5 text-xs text-meta">
              <span>Enter 送出 · Esc 關閉</span>
              <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono">
                <Command size={10} />
                K
              </kbd>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
