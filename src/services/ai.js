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

export function isMeaningfulText(text) {
  const cleaned = removeFillers(text)
  return cleaned.length >= 2
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
    return { classification: 'ambiguous', confidence: 0.4 }
  }

  if (taskScore > 0 && studyScore > 0) {
    const dominant = taskScore >= studyScore ? 'task' : 'study'
    const confidence = 0.55 + Math.min(taskScore, studyScore) * 0.05
    return { classification: dominant, confidence: Math.min(confidence, 0.65) }
  }

  if (taskScore > 0) {
    return { classification: 'task', confidence: Math.min(0.95, 0.65 + taskScore * 0.15) }
  }

  return { classification: 'study', confidence: Math.min(0.95, 0.65 + studyScore * 0.15) }
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
    classification: classification === 'ambiguous' ? 'task' : classification,
    confidence,
    source: 'local',
  }
}

export async function chatWithNotes(question, notes = []) {
  const apiUrl = import.meta.env.VITE_LLM_API_URL
  const q = question?.trim()
  if (!q) return { answer: '請輸入問題', source: 'local', citations: [] }

  const scored = notes
    .map((note) => {
      const text = `${note.title || ''} ${note.content || ''}`.toLowerCase()
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
      const score = terms.reduce((sum, term) => (text.includes(term) ? sum + 1 : sum), 0)
      return { note, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const citations = scored.map(({ note }) => ({
    title: note.title || note.obsidianPath || '未命名',
    path: note.obsidianPath || null,
    snippet: (note.content || '').slice(0, 200),
  }))

  if (!scored.length) {
    return {
      answer: '在已同步的筆記中找不到相關內容。請先同步 Wiki 或新增學習筆記。',
      source: 'local',
      citations: [],
    }
  }

  const context = scored
    .map(({ note }, i) => `[${i + 1}] ${note.title || note.obsidianPath}\n${(note.content || '').slice(0, 800)}`)
    .join('\n\n')

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_with_notes',
          question: q,
          context,
          citations,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        return {
          answer: data.answer || data.text || '',
          source: 'llm',
          citations: data.citations || citations,
        }
      }
    } catch (err) {
      console.warn('[AI] chatWithNotes LLM unavailable', err)
    }
  }

  const top = scored[0].note
  return {
    answer: `根據「${top.title || top.obsidianPath}」：\n\n${(top.content || '').slice(0, 400)}…`,
    source: 'local',
    citations,
  }
}
