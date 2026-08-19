import { useState, useEffect } from 'react'
import { Settings, Copy, RefreshCw, Smartphone } from 'lucide-react'
import {
  getCaptureToken,
  regenerateCaptureToken,
  getSlippingDays,
  setSlippingDays,
} from '../../db'
import { DEFAULT_SLIPPING_DAYS } from '../../db/constants'
import { emitToast } from '../../context/ToastContext'

const BRIDGE_URL = import.meta.env.VITE_OBSIDIAN_BRIDGE_URL || 'http://localhost:8787'

export function IntegrationsPanel() {
  const [token, setToken] = useState('')
  const [slippingDays, setSlippingDaysLocal] = useState(DEFAULT_SLIPPING_DAYS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCaptureToken(), getSlippingDays()]).then(([t, days]) => {
      setToken(t)
      setSlippingDaysLocal(days ?? DEFAULT_SLIPPING_DAYS)
      setLoading(false)
    })
  }, [])

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(token)
    emitToast('已複製 Capture Token', 'success')
  }

  const handleRegenerate = async () => {
    const newToken = await regenerateCaptureToken()
    setToken(newToken)
    emitToast('已重新產生 Token', 'success')
  }

  const handleSlippingChange = async (e) => {
    const days = Number(e.target.value)
    setSlippingDaysLocal(days)
    await setSlippingDays(days)
  }

  const shortcutUrl = `${BRIDGE_URL}/capture`

  if (loading) return null

  return (
    <section className="bento-card space-y-5 p-5">
      <div className="flex items-center gap-2">
        <Settings size={18} className="text-accent" />
        <h2 className="text-sm font-semibold text-fg">整合設定</h2>
        <span className="text-xs text-meta">Phase D</span>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-meta">Capture Token（行動裝置快捷輸入）</label>
        <div className="flex gap-2">
          <code className="input-field flex-1 truncate px-3 py-2 text-xs">{token}</code>
          <button type="button" onClick={handleCopyToken} className="btn-ghost px-3" title="複製">
            <Copy size={16} />
          </button>
          <button type="button" onClick={handleRegenerate} className="btn-ghost px-3" title="重新產生">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-meta">Bridge Capture 端點</label>
        <code className="block rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs text-muted">
          POST {shortcutUrl}
        </code>
        <p className="text-xs text-meta">
          Header: <code>Authorization: Bearer {'<token>'}</code> · Body: <code>{'{"text":"..."}'}</code>
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="slipping-days" className="text-xs font-medium text-meta">
          滑落提醒天數
        </label>
        <input
          id="slipping-days"
          type="number"
          min={1}
          max={30}
          value={slippingDays}
          onChange={handleSlippingChange}
          className="input-field w-24 px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-md border border-dashed border-border p-3">
        <div className="flex items-start gap-2">
          <Smartphone size={16} className="mt-0.5 shrink-0 text-muted" />
          <div className="text-xs text-muted">
            <p className="font-medium text-fg">iOS 快捷指令</p>
            <p className="mt-1">
              建立「取得輸入 → 取得 URL 內容」動作，POST 到上方端點並帶 Bearer Token。
              Personal OS 會在開啟時自動同步佇列。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
