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
    ? 'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3'
    : 'fixed bottom-16 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 p-3 backdrop-blur-md sm:sticky sm:top-14 sm:bottom-auto sm:border-b sm:border-t-0'

  return (
    <div className={inline ? '' : formClass} style={inline ? undefined : { paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <form onSubmit={handleSubmit} className={inline ? formClass : ''}>
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="閃電輸入 — 2 秒捕捉想法..."
            autoComplete="off"
            enterKeyHint="done"
            className="min-h-11 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-4 text-base text-slate-900 dark:text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            onClick={handleVoice}
            disabled={isListening}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-xl border transition-colors ${
              isListening
                ? 'border-red-500/50 bg-red-500/10 text-red-400'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-500 hover:text-purple-400'
            }`}
            aria-label="語音輸入"
          >
            {isListening ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
          </button>
          <button
            type="submit"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
            aria-label="提交"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
      {voiceError && (
        <p className="mx-auto mt-2 max-w-3xl text-xs text-red-400">{voiceError}</p>
      )}
      {isListening && (
        <p className="mx-auto mt-2 max-w-3xl text-xs text-purple-400">正在聆聽...</p>
      )}
    </div>
  )
}
