import { useState } from 'react'
import { Archive, ArrowRightCircle, Inbox } from 'lucide-react'
import { useInboxItems, useProjects } from '../hooks/useIndexedDB'
import { archiveInboxItem, convertInboxToTask, TASK_CONTEXT, TASK_PRIORITY } from '../db'
import { Modal } from './ui/Modal'

export function InboxList() {
  const items = useInboxItems('pending')
  const projects = useProjects()
  const [converting, setConverting] = useState(null)
  const [priority, setPriority] = useState(TASK_PRIORITY.MEDIUM)
  const [context, setContext] = useState(TASK_CONTEXT.WORK)
  const [projectId, setProjectId] = useState('')

  const handleArchive = async (id) => {
    await archiveInboxItem(id)
  }

  const handleConvert = async () => {
    if (!converting) return
    await convertInboxToTask(converting.id, {
      priority,
      context,
      projectId: projectId || null,
    })
    setConverting(null)
    setPriority(TASK_PRIORITY.MEDIUM)
    setContext(TASK_CONTEXT.WORK)
    setProjectId('')
  }

  const openConvert = (item) => {
    setConverting(item)
    setPriority(TASK_PRIORITY.MEDIUM)
    setContext(TASK_CONTEXT.WORK)
    setProjectId('')
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Inbox size={20} className="text-blue-500" />
        <h2 className="text-lg font-semibold">收件匣</h2>
        {items && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium dark:bg-slate-700">
            {items.length}
          </span>
        )}
      </div>

      {!items?.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600">
          收件匣是空的 — 在下方輸入你的第一個想法
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="flex-1 text-sm leading-relaxed">{item.text}</p>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openConvert(item)}
                  className="flex min-h-9 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <ArrowRightCircle size={14} />
                  轉化
                </button>
                <button
                  type="button"
                  onClick={() => handleArchive(item.id)}
                  className="flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Archive size={14} />
                  封存
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!converting} onClose={() => setConverting(null)} title="轉化為待辦">
        {converting && (
          <div className="space-y-4">
            <p className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-700">
              {converting.text}
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium">優先級</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              >
                <option value={TASK_PRIORITY.HIGH}>高</option>
                <option value={TASK_PRIORITY.MEDIUM}>中</option>
                <option value={TASK_PRIORITY.LOW}>低</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">情境標籤</label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              >
                <option value={TASK_CONTEXT.WORK}>Work</option>
                <option value={TASK_CONTEXT.LIFE}>Life</option>
                <option value={TASK_CONTEXT.ON_THE_GO}>On-the-go</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">專案（選填）</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              >
                <option value="">未分類</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleConvert}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              建立待辦
            </button>
          </div>
        )}
      </Modal>
    </section>
  )
}
