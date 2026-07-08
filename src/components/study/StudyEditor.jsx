import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { addStudyItem, STUDY_TYPE, STUDY_STATUS } from '../../db'
import { useDomains } from '../../hooks/useIndexedDB'

export function StudyEditor({ onCreated }) {
  const domains = useDomains()
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState(STUDY_TYPE.NOTE)
  const [status, setStatus] = useState(STUDY_STATUS.READING)
  const [domainId, setDomainId] = useState('')
  const [isHighlight, setIsHighlight] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const title = titleRef.current?.value?.trim()
    const content = contentRef.current?.value?.trim()
    if (!title) return

    await addStudyItem({
      type,
      title,
      content: content || '',
      domainId: domainId || domains?.[0]?.id,
      status,
      isHighlight,
    })

    titleRef.current.value = ''
    contentRef.current.value = ''
    setIsOpen(false)
    onCreated?.()
  }

  const openForm = () => {
    setDomainId(domains?.[0]?.id || '')
    setIsOpen(true)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={openForm}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 py-3 text-sm text-slate-400 hover:border-green-500/50 hover:text-green-400"
      >
        <Plus size={16} />
        新增筆記 / 書籍 / 文章
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
      <input
        ref={titleRef}
        type="text"
        placeholder="標題..."
        autoFocus
        className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 outline-none focus:border-green-500"
      />
      <textarea
        ref={contentRef}
        placeholder="Markdown 內容... 支援 #標籤"
        rows={5}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-green-500"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        >
          <option value={STUDY_TYPE.NOTE}>筆記</option>
          <option value={STUDY_TYPE.BOOK}>書籍</option>
          <option value={STUDY_TYPE.ARTICLE}>文章</option>
          <option value={STUDY_TYPE.QUOTE}>金句</option>
          <option value={STUDY_TYPE.HIGHLIGHT}>重點</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        >
          <option value={STUDY_STATUS.READING}>閱讀中</option>
          <option value={STUDY_STATUS.COMPLETED}>已完成</option>
        </select>
      </div>
      <select
        value={domainId}
        onChange={(e) => setDomainId(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
      >
        {domains?.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input
          type="checkbox"
          checked={isHighlight}
          onChange={(e) => setIsHighlight(e.target.checked)}
          className="rounded"
        />
        設為每日復現重點
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-400 hover:bg-slate-800"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          建立
        </button>
      </div>
    </form>
  )
}
