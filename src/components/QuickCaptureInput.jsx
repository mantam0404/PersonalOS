import { useRef, useCallback, useState } from 'react'
import { Send, Mic, Loader2 } from 'lucide-react'
import { addInboxItem, CAPTURE_TYPE } from '../db'
import { isSpeechRecognitionSupported, startVoiceCapture } from '../services/voice'

export function QuickCaptureInput({ inline = false }) {
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.()
    const text = inputRef.current?.value?.trim()
    if (!text) return

    inputRef.current.value = ''
    await addInboxItem(text, CAPTURE_TYPE.TEXT)
    inputRef.current?.focus()
  }, [])

  const handleVoice = useCallback(() => {
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
        if (inputRef.current) {
          inputRef.current.value = transcript
        }
        await addInboxItem(transcript, CAPTURE_TYPE.VOICE)
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

  const formClass = inline
    ? 'bento-card p-3'
    : 'fixed bottom-16 left-0 right-0 z-40 vercel-nav border-b-0 border-t p-3 sm:sticky sm:top-14 sm:bottom-auto sm:border-b sm:border-t-0'

  return (
    <div className={inline ? '' : formClass} style={inline ? undefined : { paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <form onSubmit={handleSubmit} className={inline ? formClass : ''}>
        <div className="mx-auto flex max-w-container gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="閃電輸入 — 2 秒捕捉想法..."
            autoComplete="off"
            enterKeyHint="done"
            className="min-h-11 flex-1 rounded-md border border-border bg-surface px-4 text-base text-fg outline-none transition-colors placeholder:text-muted focus:shadow-focus"
          />
          <button
            type="button"
            onClick={handleVoice}
            disabled={isListening}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-md border transition-colors ${
              isListening
                ? 'border-danger/50 bg-danger/10 text-danger'
                : 'border-border text-muted hover:border-accent hover:text-accent'
            }`}
            aria-label="語音輸入"
          >
            {isListening ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
          </button>
          <button
            type="submit"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md bg-accent text-accent-on transition-colors hover:bg-accent-hover"
            aria-label="提交"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
      {voiceError && (
        <p className="mx-auto mt-2 max-w-container text-xs text-danger">{voiceError}</p>
      )}
      {isListening && (
        <p className="mx-auto mt-2 max-w-container text-xs text-accent">正在聆聽...</p>
      )}
    </div>
  )
}
