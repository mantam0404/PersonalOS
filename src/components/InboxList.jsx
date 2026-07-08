import { useState } from 'react'
import { Archive, ArrowRightCircle, Inbox } from 'lucide-react'
import { useInboxItems, useProjects, useDomains } from '../hooks/useIndexedDB'
import { archiveInboxItem, convertInboxToTask, TASK_PRIORITY } from '../db'
import { Modal } from './ui/Modal'

export function InboxList() {
  const items = useInboxItems('pending')
  const projects = useProjects()
  const domains = useDomains()
  const [converting, setConverting] = useState(null)
  const [priority, setPriority] = useState(TASK_PRIORITY.MEDIUM)
  const [domainId, setDomainId] = useState('')
  const [projectId, setProjectId] = useState('')

  const handleArchive = async (id) => {
    await archiveInboxItem(id)
  }

  const handleConvert = async () => {
    if (!converting) return
    await convertInboxToTask(converting.id, {
      priority,
      domainId: domainId || null,
      projectId: projectId || null,
    })
    setConverting(null)
    setPriority(TASK_PRIORITY.MEDIUM)
    setDomainId('')
    setProjectId('')
  }

  const openConvert = (item) => {
    setConverting(item)
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
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
            {items.length}
          </span>
        )}
      </div>

      {!items?.length ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
          收件匣是空的 — 在上方輸入你的第一個想法
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3"
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
                  className="flex min-h-9 items-center gap-1 rounded-lg border border-slate-700 px-3 text-xs font-medium text-slate-400 hover:bg-slate-800"
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
            <p className="rounded-lg bg-slate-800 p-3 text-sm">{converting.text}</p>

            <div>
              <label className="mb-1 block text-sm font-medium">優先級</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              >
                <option value={TASK_PRIORITY.HIGH}>高</option>
                <option value={TASK_PRIORITY.MEDIUM}>中</option>
                <option value={TASK_PRIORITY.LOW}>低</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">領域 Domain</label>
              <select
                value={domainId}
                onChange={(e) => {
                  setDomainId(e.target.value)
                  setProjectId('')
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              >
                {domains?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">專案（選填）</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">未分類</option>
                {filteredProjects?.map((p) => (
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
