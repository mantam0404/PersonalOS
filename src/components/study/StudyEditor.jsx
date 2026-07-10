import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { addStudyItem, STUDY_TYPE, STUDY_STATUS } from '../../db'
import { useDomains } from '../../hooks/useIndexedDB'

const inputClass = 'input-field min-h-10 w-full px-3 text-sm'
const selectClass = 'select-field w-full px-3 py-2 text-sm'

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
        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-3 text-sm text-muted transition-colors hover:border-success/50 hover:text-success"
      >
        <Plus size={16} />
        新增筆記 / 書籍 / 文章
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bento-card space-y-3 p-4">
      <input
        ref={titleRef}
        type="text"
        placeholder="標題..."
        autoFocus
        className={inputClass}
      />
      <textarea
        ref={contentRef}
        placeholder="Markdown 內容... 支援 #標籤"
        rows={5}
        className={`${inputClass} py-2`}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={selectClass}
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
          className={selectClass}
        >
          <option value={STUDY_STATUS.READING}>閱讀中</option>
          <option value={STUDY_STATUS.COMPLETED}>已完成</option>
        </select>
      </div>
      <select
        value={domainId}
        onChange={(e) => setDomainId(e.target.value)}
        className={selectClass}
      >
        {domains?.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-muted">
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
          className="btn-ghost flex-1 py-2.5 text-sm"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 rounded-md bg-success py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          建立
        </button>
      </div>
    </form>
  )
}
