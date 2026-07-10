import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown'
import { ArrowLeft, Star, Trash2, ArrowRightCircle, Link2, Pencil, X, Check } from 'lucide-react'
import { useStudyItem, useStudyRelated, useTaskByStudySource } from '../../hooks/useStudy'
import { useDomains } from '../../hooks/useIndexedDB'
import {
  updateStudyItem,
  deleteStudyItem,
  convertStudySnippetToTask,
  touchStudyItem,
  STUDY_STATUS,
  STUDY_TYPE,
} from '../../db'

const inputClass = 'input-field min-h-10 w-full px-3 text-sm'
const selectClass = 'select-field w-full px-3 py-2 text-sm'

export function StudyDetail({ id }) {
  const navigate = useNavigate()
  const item = useStudyItem(id)
  const related = useStudyRelated(id)
  const derivedTasks = useTaskByStudySource(id)
  const domains = useDomains()
  const [selectedText, setSelectedText] = useState('')
  const [converting, setConverting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)

  useEffect(() => {
    if (id) touchStudyItem(id)
  }, [id])

  useEffect(() => {
    if (item && editing) {
      setEditForm({
        title: item.title,
        content: item.content || '',
        type: item.type,
        status: item.status,
        domainId: item.domainId,
      })
    }
  }, [item, editing])

  if (item === undefined) return null
  if (!item) {
    return (
      <div className="text-center text-muted">
        <p>筆記不存在</p>
        <Link to="/study" className="mt-2 text-accent">返回學習庫</Link>
      </div>
    )
  }

  const domain = domains?.find((d) => d.id === item.domainId)

  const handleSelection = () => {
    const text = window.getSelection()?.toString()?.trim()
    setSelectedText(text || '')
  }

  const handleConvertToTask = async () => {
    const snippet = selectedText || item.content?.slice(0, 200) || item.title
    setConverting(true)
    await convertStudySnippetToTask(id, snippet, { domainId: item.domainId })
    setConverting(false)
    setSelectedText('')
  }

  const handleToggleHighlight = async () => {
    await updateStudyItem(id, { isHighlight: !item.isHighlight })
  }

  const handleStatusChange = async (status) => {
    await updateStudyItem(id, { status })
  }

  const handleDelete = async () => {
    await deleteStudyItem(id)
    navigate('/study')
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editForm?.title?.trim()) return
    await updateStudyItem(id, {
      title: editForm.title.trim(),
      content: editForm.content,
      type: editForm.type,
      status: editForm.status,
      domainId: editForm.domainId,
    })
    setEditing(false)
  }

  return (
    <div className="space-y-6">
      <Link to="/study" className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg">
        <ArrowLeft size={16} />
        返回學習庫
      </Link>

      {editing && editForm ? (
        <form onSubmit={handleSaveEdit} className="bento-card space-y-3 p-4">
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            placeholder="標題..."
            autoFocus
            className={inputClass}
          />
          <textarea
            value={editForm.content}
            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            placeholder="Markdown 內容..."
            rows={8}
            className={`${inputClass} py-2`}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              className={selectClass}
            >
              <option value={STUDY_TYPE.NOTE}>筆記</option>
              <option value={STUDY_TYPE.BOOK}>書籍</option>
              <option value={STUDY_TYPE.ARTICLE}>文章</option>
              <option value={STUDY_TYPE.QUOTE}>金句</option>
              <option value={STUDY_TYPE.HIGHLIGHT}>重點</option>
            </select>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className={selectClass}
            >
              <option value={STUDY_STATUS.READING}>閱讀中</option>
              <option value={STUDY_STATUS.COMPLETED}>已完成</option>
              <option value={STUDY_STATUS.ARCHIVED}>已封存</option>
            </select>
          </div>
          <select
            value={editForm.domainId}
            onChange={(e) => setEditForm({ ...editForm, domainId: e.target.value })}
            className={selectClass}
          >
            {domains?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-ghost flex flex-1 items-center justify-center gap-1 py-2.5 text-sm"
            >
              <X size={16} />
              取消
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-success py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              <Check size={16} />
              儲存
            </button>
          </div>
        </form>
      ) : (
        <>
          <header>
            <h1 className="text-xl font-semibold text-fg">{item.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {domain && (
                <span
                  className="rounded px-2 py-0.5 text-xs"
                  style={{ backgroundColor: `${domain.color}22`, color: domain.color }}
                >
                  {domain.name}
                </span>
              )}
              {item.tags?.map((tag) => (
                <span key={tag} className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <Pencil size={14} />
              編輯
            </button>
            <button
              type="button"
              onClick={handleToggleHighlight}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs ${
                item.isHighlight
                  ? 'bg-warn/15 text-warn'
                  : 'btn-ghost'
              }`}
            >
              <Star size={14} fill={item.isHighlight ? 'currentColor' : 'none'} />
              {item.isHighlight ? '已設重點' : '設為重點'}
            </button>
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="select-field px-3 py-1.5 text-xs"
            >
              <option value={STUDY_STATUS.READING}>閱讀中</option>
              <option value={STUDY_STATUS.COMPLETED}>已完成</option>
              <option value={STUDY_STATUS.ARCHIVED}>已封存</option>
            </select>
            <button
              type="button"
              onClick={handleConvertToTask}
              disabled={converting}
              className="flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs text-accent-on hover:bg-accent-hover"
            >
              <ArrowRightCircle size={14} />
              {selectedText ? '轉選取為待辦' : '轉為待辦'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs text-danger hover:text-danger"
            >
              <Trash2 size={14} />
              刪除
            </button>
          </div>

          {selectedText && (
            <p className="rounded-md bg-accent/10 px-3 py-2 text-xs text-accent">
              已選取：「{selectedText.slice(0, 80)}{selectedText.length > 80 ? '...' : ''}」
            </p>
          )}

          <article
            onMouseUp={handleSelection}
            onTouchEnd={handleSelection}
            className="prose prose-sm max-w-none bento-card p-4 text-fg dark:prose-invert"
          >
            <Markdown>{item.content || '_（無內容）_'}</Markdown>
          </article>
        </>
      )}

      {derivedTasks?.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-muted">由此筆記衍生的待辦</h3>
          <ul className="space-y-1">
            {derivedTasks.filter(Boolean).map((task) => (
              <li key={task.id} className="bento-card px-3 py-2 text-sm text-fg">
                {task.title}
                <span className={`ml-2 text-xs ${task.status === 'done' ? 'text-success' : 'text-meta'}`}>
                  {task.status === 'done' ? '已完成' : '待辦'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related?.length > 0 && (
        <section className="space-y-2">
          <h3 className="flex items-center gap-1 text-sm font-medium text-muted">
            <Link2 size={14} />
            關聯筆記
          </h3>
          <ul className="space-y-1">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/study/${r.id}`}
                  className="block rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-fg transition-colors hover:bg-surface"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
