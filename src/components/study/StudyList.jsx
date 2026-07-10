import { Link } from 'react-router-dom'
import { BookOpen, FileText, Quote, Highlighter, BookMarked } from 'lucide-react'
import { useStudyItems } from '../../hooks/useStudy'
import { useDomains } from '../../hooks/useIndexedDB'
import { STUDY_TYPE, STUDY_STATUS } from '../../db'

const TYPE_ICONS = {
  [STUDY_TYPE.BOOK]: BookMarked,
  [STUDY_TYPE.ARTICLE]: FileText,
  [STUDY_TYPE.NOTE]: BookOpen,
  [STUDY_TYPE.QUOTE]: Quote,
  [STUDY_TYPE.HIGHLIGHT]: Highlighter,
}

const TYPE_LABELS = {
  [STUDY_TYPE.BOOK]: '書籍',
  [STUDY_TYPE.ARTICLE]: '文章',
  [STUDY_TYPE.NOTE]: '筆記',
  [STUDY_TYPE.QUOTE]: '金句',
  [STUDY_TYPE.HIGHLIGHT]: '重點',
}

const STATUS_LABELS = {
  [STUDY_STATUS.READING]: '閱讀中',
  [STUDY_STATUS.COMPLETED]: '已完成',
  [STUDY_STATUS.ARCHIVED]: '已封存',
}

export function StudyList({ typeFilter = 'all' }) {
  const items = useStudyItems(typeFilter)
  const domains = useDomains()

  const getDomain = (id) => domains?.find((d) => d.id === id)

  if (!items?.length) {
    return (
      <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
        知識庫是空的 — 從捕捉轉化或新增筆記
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] || BookOpen
        const domain = getDomain(item.domainId)
        return (
          <li key={item.id}>
            <Link
              to={`/study/${item.id}`}
              className="bento-card flex items-start gap-3 p-3 transition-colors hover:bg-surface-elevated"
            >
              <Icon size={18} className="mt-0.5 shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-fg">{item.title || '未命名'}</p>
                  {item.isHighlight && (
                    <span className="rounded bg-warn/15 px-1.5 py-0.5 text-xs text-warn">
                      重點
                    </span>
                  )}
                </div>
                {item.content && (
                  <p className="mt-1 truncate text-xs text-meta">{item.content}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-xs text-muted">
                    {TYPE_LABELS[item.type]}
                  </span>
                  <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-xs text-muted">
                    {STATUS_LABELS[item.status]}
                  </span>
                  {domain && (
                    <span
                      className="rounded px-1.5 py-0.5 text-xs"
                      style={{ backgroundColor: `${domain.color}22`, color: domain.color }}
                    >
                      {domain.name}
                    </span>
                  )}
                  {item.tags?.map((tag) => (
                    <span key={tag} className="rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
