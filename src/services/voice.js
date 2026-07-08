export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function startVoiceCapture({ onResult, onError, onEnd }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    onError?.(new Error('此瀏覽器不支援語音輸入'))
    return null
  }

  const recognition = new SpeechRecognition()
  recognition.lang = 'zh-TW'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript
    if (transcript) onResult?.(transcript)
  }

  recognition.onerror = (event) => {
    onError?.(new Error(event.error || '語音識別失敗'))
  }

  recognition.onend = () => {
    onEnd?.()
  }

  recognition.start()
  return recognition
}

export async function transcribeWithWhisper(_audioBlob) {
  const apiUrl = import.meta.env.VITE_WHISPER_API_URL
  if (!apiUrl) {
    return { text: null, error: 'Whisper API 尚未配置。請設定 VITE_WHISPER_API_URL。' }
  }
  return { text: null, error: 'Whisper 接口已預留，需後端 proxy' }
}
