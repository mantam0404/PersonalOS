const PRIORITY_STYLES = {
  high: 'bg-danger/15 text-danger',
  medium: 'bg-warn/15 text-warn',
  low: 'bg-surface border border-border text-muted',
}

const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface border border-border text-muted',
    work: 'bg-accent/15 text-accent',
    life: 'bg-success/15 text-success',
    'on-the-go': 'bg-warn/15 text-warn',
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
