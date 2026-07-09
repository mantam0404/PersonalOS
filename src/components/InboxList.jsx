import { useState } from 'react'
import { Archive, ArrowRightCircle, Inbox, BookOpen, Loader2 } from 'lucide-react'
import { useInboxItems, useProjects, useDomains } from '../hooks/useIndexedDB'
import {
  archiveInboxItem,
  convertInboxToTask,
  convertInboxToStudy,
  TASK_PRIORITY,
  STUDY_TYPE,
} from '../db'
import { Modal } from './ui/Modal'

const AI_STATUS_LABELS = {
  pending: { label: '待處理', className: 'bg-slate-700 text-slate-600 dark:text-slate-400' },
  processing: { label: 'AI 處理中', className: 'bg-purple-500/15 text-purple-400' },
  done: { label: '待確認', className: 'bg-blue-500/15 text-blue-400' },
  error: { label: '處理失敗', className: 'bg-red-500/15 text-red-400' },
}

const CLASS_LABELS = {
  task: '任務',
  study: '知識',
}

function AiBadge({ item }) {
  const status = AI_STATUS_LABELS[item.aiStatus] || AI_STATUS_LABELS.pending
  return (
    <div className="flex flex-wrap gap-1">
      <span className={`rounded px-1.5 py-0.5 text-xs ${status.className}`}>
        {item.aiStatus === 'processing' ? (
          <span className="flex items-center gap-1">
            <Loader2 size={10} className="animate-spin" /> {status.label}
          </span>
        ) : (
          status.label
        )}
      </span>
      {item.aiClassification && (
        <span className="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-xs text-slate-600 dark:text-slate-400">
          {CLASS_LABELS[item.aiClassification] || item.aiClassification}
          {item.aiConfidence != null && ` ${Math.round(item.aiConfidence * 100)}%`}
        </span>
      )}
    </div>
  )
}

export function InboxList() {
  const items = useInboxItems('pending')
  const projects = useProjects()
  const domains = useDomains()
  const [converting, setConverting] = useState(null)
  const [convertMode, setConvertMode] = useState('task')
  const [priority, setPriority] = useState(TASK_PRIORITY.MEDIUM)
  const [domainId, setDomainId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [studyType, setStudyType] = useState(STUDY_TYPE.NOTE)

  const handleArchive = async (id) => {
    await archiveInboxItem(id)
  }

  const handleConvert = async () => {
    if (!converting) return
    if (convertMode === 'task') {
      await convertInboxToTask(converting.id, {
        priority,
        domainId: domainId || null,
        projectId: projectId || null,
      })
    } else {
      await convertInboxToStudy(converting.id, {
        domainId: domainId || null,
        type: studyType,
      })
    }
    setConverting(null)
    resetForm()
  }

  const resetForm = () => {
    setPriority(TASK_PRIORITY.MEDIUM)
    setDomainId('')
    setProjectId('')
    setStudyType(STUDY_TYPE.NOTE)
    setConvertMode('task')
  }

  const openConvert = (item, mode = 'task') => {
    setConverting(item)
    setConvertMode(mode)
    setPriority(TASK_PRIORITY.MEDIUM)
    setDomainId(domains?.[0]?.id || '')
    setProjectId('')
  }

  const filteredProjects = projects?.filter(
    (p) => !domainId || p.domainId === domainId,
  )

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Inbox size={20} className="text-blue-400" />
        <h2 className="text-lg font-semibold">收件匣</h2>
        {items && (
          <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            {items.length}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500">
        AI 會自動去贅詞並分流；信心 &lt; 70% 的項目留待手動確認
      </p>

      {!items?.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500">
          收件匣是空的 — 輸入後 AI 會自動處理
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
            >
              <div className="mb-2">
                <AiBadge item={item} />
              </div>
              <p className="mb-2 text-sm leading-relaxed">
                {item.cleanedText || item.text}
              </p>
              {item.rawText !== item.cleanedText && item.cleanedText && (
                <p className="mb-2 text-xs text-slate-500 line-through">
                  原文：{item.rawText}
                </p>
              )}
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openConvert(item, 'task')}
                  className="flex min-h-9 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <ArrowRightCircle size={14} />
                  轉待辦
                </button>
                <button
                  type="button"
                  onClick={() => openConvert(item, 'study')}
                  className="flex min-h-9 items-center gap-1 rounded-lg bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700"
                >
                  <BookOpen size={14} />
                  轉筆記
                </button>
                <button
                  type="button"
                  onClick={() => handleArchive(item.id)}
                  className="flex min-h-9 items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <Archive size={14} />
                  封存
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!converting}
        onClose={() => setConverting(null)}
        title={convertMode === 'task' ? '轉化為待辦' : '轉化為筆記'}
      >
        {converting && (
          <div className="space-y-4">
            <p className="rounded-lg bg-slate-200 dark:bg-slate-800 p-3 text-sm">
              {converting.cleanedText || converting.text}
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium">領域 Domain</label>
              <select
                value={domainId}
                onChange={(e) => {
                  setDomainId(e.target.value)
                  setProjectId('')
                }}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                {domains?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {convertMode === 'task' ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">優先級</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value={TASK_PRIORITY.HIGH}>高</option>
                    <option value={TASK_PRIORITY.MEDIUM}>中</option>
                    <option value={TASK_PRIORITY.LOW}>低</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">專案（選填）</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="">未分類</option>
                    {filteredProjects?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium">筆記類型</label>
                <select
                  value={studyType}
                  onChange={(e) => setStudyType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value={STUDY_TYPE.NOTE}>筆記</option>
                  <option value={STUDY_TYPE.BOOK}>書籍</option>
                  <option value={STUDY_TYPE.ARTICLE}>文章</option>
                  <option value={STUDY_TYPE.QUOTE}>金句</option>
                  <option value={STUDY_TYPE.HIGHLIGHT}>重點</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleConvert}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              {convertMode === 'task' ? '建立待辦' : '建立筆記'}
            </button>
          </div>
        )}
      </Modal>
    </section>
  )
}
