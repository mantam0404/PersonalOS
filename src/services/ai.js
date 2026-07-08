const FILLER_PATTERN = /[嗯啊呃欸]+|那个|這個|就是說|然後呢/g

const TASK_KEYWORDS = [
  /明天|後天|今天|下週|截止|deadline|交|完成|買|call|打電話|寄|送|預約|開會|報告|todo|待辦/i,
  /要記得|别忘了|提醒|需要|must|need to|should/i,
]

const STUDY_KEYWORDS = [
  /學到|筆記|note|概念|idea|quote|金句|閱讀|書|article|react|javascript|原理|理解/i,
  /#([\w\u4e00-\u9fff]+)/,
]

export function removeFillers(text) {
  return text
    .replace(FILLER_PATTERN, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function classifyCapture(text) {
  let taskScore = 0
  let studyScore = 0

  for (const pattern of TASK_KEYWORDS) {
    if (pattern.test(text)) taskScore += 1
  }
  for (const pattern of STUDY_KEYWORDS) {
    if (pattern.test(text)) studyScore += 1
  }

  if (taskScore === 0 && studyScore === 0) {
    return { classification: 'task', confidence: 0.5 }
  }

  if (taskScore >= studyScore) {
    const confidence = Math.min(0.95, 0.6 + taskScore * 0.15)
    return { classification: 'task', confidence }
  }

  const confidence = Math.min(0.95, 0.6 + studyScore * 0.15)
  return { classification: 'study', confidence }
}

export async function processCapture(rawText) {
  const apiUrl = import.meta.env.VITE_LLM_API_URL

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, action: 'classify_and_rewrite' }),
      })
      if (response.ok) {
        return await response.json()
      }
    } catch (err) {
      console.warn('[AI] LLM API unavailable, using local fallback', err)
    }
  }

  const cleanedText = removeFillers(rawText)
  const { classification, confidence } = classifyCapture(cleanedText)

  return {
    cleanedText: cleanedText || rawText,
    classification,
    confidence,
    source: 'local',
  }
}

export async function chatWithNotes(_question, _notes) {
  const apiUrl = import.meta.env.VITE_LLM_API_URL
  if (!apiUrl) {
    return { answer: 'LLM API 尚未配置。請設定 VITE_LLM_API_URL。', source: 'stub' }
  }
  return { answer: 'Chat with notes — API 接口已預留', source: 'stub' }
}
