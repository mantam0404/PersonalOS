export const INBOX_STATUS = {
  PENDING: 'pending',
  ARCHIVED: 'archived',
}

export const TASK_STATUS = {
  TODO: 'todo',
  DONE: 'done',
}

export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const TASK_CONTEXT = {
  WORK: 'work',
  LIFE: 'life',
  ON_THE_GO: 'on-the-go',
}

export const TASK_TYPE = {
  TASK: 'task',
  ROUTINE: 'routine',
}

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

export const STUDY_TYPE = {
  BOOK: 'book',
  ARTICLE: 'article',
  NOTE: 'note',
  QUOTE: 'quote',
  HIGHLIGHT: 'highlight',
}

export const STUDY_STATUS = {
  READING: 'reading',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
}

export const CAPTURE_TYPE = {
  TEXT: 'text',
  VOICE: 'voice',
}

export const DEFAULT_DOMAINS = [
  { name: '工作', color: '#3b82f6', sortOrder: 0, legacyContext: TASK_CONTEXT.WORK },
  { name: '生活', color: '#22c55e', sortOrder: 1, legacyContext: TASK_CONTEXT.LIFE },
  { name: '自我提升', color: '#a855f7', sortOrder: 2, legacyContext: TASK_CONTEXT.ON_THE_GO },
]
