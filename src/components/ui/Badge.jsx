const PRIORITY_STYLES = {
  high: 'bg-red-500/15 text-red-600 dark:text-red-400',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  low: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
}

const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    work: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    life: 'bg-green-500/15 text-green-600 dark:text-green-400',
    'on-the-go': 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    ...PRIORITY_STYLES,
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return <Badge variant={priority}>{PRIORITY_LABELS[priority] || priority}</Badge>
}

export function DomainBadge({ domain }) {
  if (!domain) return null
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${domain.color}22`, color: domain.color }}
    >
      {domain.name}
    </span>
  )
}

export function ContextBadge({ context }) {
  const labels = { work: 'Work', life: 'Life', 'on-the-go': 'On-the-go' }
  return <Badge variant={context}>{labels[context] || context}</Badge>
}
