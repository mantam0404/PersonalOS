import { removeFillers } from './ai.js'

const COMPLETE_PATTERNS = [/完成(?:了)?(.+)/, /done\s+(.+)/i, /mark\s+(.+)\s+done/i, /把(.+?)標記?完成/]
const TASK_PATTERNS = [
  /(?:新增|加|建立|記得|提醒|待辦|todo)[：: ]?(.+)/i,
  /要(?:記得|做)(.+)/,
  /幫我(?:記|加)(.+)/,
]
const JOURNAL_PATTERNS = [/日誌[：: ]?(.+)/, /journal[：: ]?(.+)/i, /今天(?:的)?(?:感想|日記|反思)[：: ]?(.+)/]
const ACTIVITY_PATTERNS = [
  /(?:花了|用了|做了)\s*(\d+(?:\.\d+)?)\s*(?:小時|hour|hr|h)\s*(?:在|做|處理)?(.+)/i,
  /(.+?)\s*(\d+(?:\.\d+)?)\s*(?:小時|hour|hr|h)/i,
]
const STUDY_PATTERNS = [/筆記[：: ]?(.+)/, /note[：: ]?(.+)/i, /學到[：: ]?(.+)/]

const DUE_PATTERNS = [
  { pattern: /明天/, days: 1 },
  { pattern: /後天/, days: 2 },
  { pattern: /大後天/, days: 3 },
  { pattern: /下週|下星期/, days: 7 },
  { pattern: /今天|今日/, days: 0 },
]

function parseDueDate(text) {
  for (const { pattern, days } of DUE_PATTERNS) {
    if (pattern.test(text)) {
      const d = new Date()
      d.setDate(d.getDate() + days)
      d.setHours(23, 59, 59, 999)
      return d.getTime()
    }
  }
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/)
  if (isoMatch) return new Date(isoMatch[1]).getTime()
  return null
}

function stripDueHints(text) {
  return text
    .replace(/明天|後天|大後天|下週|下星期|今天|今日/g, '')
    .replace(/\d{4}-\d{2}-\d{2}/g, '')
    .trim()
}

function matchFirst(text, patterns) {
  for (const pattern of patterns) {
    const m = text.match(pattern)
    if (m?.[1]?.trim()) return m[1].trim()
  }
  return null
}

export function localParseVoiceActions(transcript) {
  const text = removeFillers(transcript)
  if (!text) return []

  const completeTitle = matchFirst(text, COMPLETE_PATTERNS)
  if (completeTitle) {
    return [{ type: 'complete_task', title: completeTitle }]
  }

  const activityMatch = text.match(ACTIVITY_PATTERNS[0]) || text.match(ACTIVITY_PATTERNS[1])
  if (activityMatch) {
    const hours = parseFloat(activityMatch[1]) || parseFloat(activityMatch[2])
    const entry = (activityMatch[2] || activityMatch[1] || '').trim()
    if (hours && entry) {
      return [{ type: 'log_activity', hours, entry, projectName: entry.split(/[，,、]/)[0]?.trim() }]
    }
  }

  const journalContent = matchFirst(text, JOURNAL_PATTERNS)
  if (journalContent) {
    return [{ type: 'create_journal', content: journalContent }]
  }

  const studyContent = matchFirst(text, STUDY_PATTERNS)
  if (studyContent) {
    return [{ type: 'create_study', title: studyContent.slice(0, 60), content: studyContent }]
  }

  const taskTitle = matchFirst(text, TASK_PATTERNS)
  if (taskTitle) {
    const dueDate = parseDueDate(text)
    return [{
      type: 'create_task',
      title: stripDueHints(taskTitle),
      dueDate,
      priority: /urgent|緊急|重要/i.test(text) ? 'high' : 'medium',
    }]
  }

  if (/任務|待辦|todo|提醒|買|call|打電話|預約|開會|報告|deadline|截止/i.test(text)) {
    return [{
      type: 'create_task',
      title: stripDueHints(text),
      dueDate: parseDueDate(text),
      priority: 'medium',
    }]
  }

  if (/筆記|note|學到|閱讀|金句|quote|#/.test(text)) {
    return [{ type: 'create_study', title: text.slice(0, 60), content: text }]
  }

  return [{ type: 'create_task', title: text, priority: 'medium' }]
}

export async function parseVoiceActions(transcript) {
  const apiUrl = import.meta.env.VITE_LLM_API_URL

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, action: 'parse_voice_actions' }),
      })
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data.actions) && data.actions.length) {
          return { actions: data.actions, source: 'llm' }
        }
      }
    } catch (err) {
      console.warn('[VoiceParser] LLM unavailable, using local fallback', err)
    }
  }

  return { actions: localParseVoiceActions(transcript), source: 'local' }
}
