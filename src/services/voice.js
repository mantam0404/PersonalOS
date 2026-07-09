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
    const code = event?.error || 'unknown'
    const messageByCode = {
      'not-allowed': '未取得麥克風權限，請在瀏覽器允許麥克風存取',
      'service-not-allowed': '瀏覽器封鎖了語音服務，請檢查網站權限設定',
      'audio-capture': '找不到可用麥克風，請檢查裝置或系統權限',
      'no-speech': '沒有偵測到語音，請再試一次',
      network: '網路異常，語音辨識失敗',
      aborted: '語音輸入已停止',
    }
    onError?.(new Error(messageByCode[code] || code || '語音識別失敗'))
  }

  recognition.onend = () => {
    onEnd?.()
  }

  try {
    recognition.start()
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error('無法啟動語音輸入'))
    return null
  }
  return recognition
}

export async function transcribeWithWhisper(_audioBlob) {
  const apiUrl = import.meta.env.VITE_WHISPER_API_URL
  if (!apiUrl) {
    return { text: null, error: 'Whisper API 尚未配置。請設定 VITE_WHISPER_API_URL。' }
  }
  return { text: null, error: 'Whisper 接口已預留，需後端 proxy' }
}
