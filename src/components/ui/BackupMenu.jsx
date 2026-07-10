import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { exportBackup, importBackup } from '../../db'
import { useToast } from '../../context/ToastContext'
import { Modal } from './Modal'

export function BackupMenu() {
  const { showToast } = useToast()
  const fileRef = useRef(null)
  const [importOpen, setImportOpen] = useState(false)
  const [replaceMode, setReplaceMode] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleExport = async () => {
    try {
      await exportBackup()
      showToast('備份已下載', 'success')
    } catch {
      showToast('匯出失敗', 'error')
    }
  }

  const handleImportClick = () => {
    setImportOpen(true)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      await importBackup(file, { replace: replaceMode })
      showToast(replaceMode ? '備份已覆蓋匯入' : '備份已合併匯入', 'success')
      setImportOpen(false)
    } catch (err) {
      showToast(err.message || '匯入失敗', 'error')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md p-2 text-muted transition-colors hover:bg-surface hover:text-fg"
          aria-label="匯出備份"
          title="匯出備份"
        >
          <Download size={18} />
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-md p-2 text-muted transition-colors hover:bg-surface hover:text-fg"
          aria-label="匯入備份"
          title="匯入備份"
        >
          <Upload size={18} />
        </button>
      </div>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="匯入備份">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            選擇之前匯出的 JSON 備份檔案。合併模式會保留現有資料並覆寫相同 ID 的項目。
          </p>
          <label className="flex items-center gap-2 text-sm text-fg-2">
            <input
              type="checkbox"
              checked={replaceMode}
              onChange={(e) => setReplaceMode(e.target.checked)}
              className="rounded"
            />
            覆蓋模式（清空現有資料後匯入）
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            disabled={busy}
            className="w-full text-sm text-muted"
          />
        </div>
      </Modal>
    </>
  )
}
