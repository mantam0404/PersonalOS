import { useState } from 'react'
import { Loader2, Plug, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { connectAndTestWikiBridge, runWikiSync, useWikiConfig, useWikiNoteCount } from '../../hooks/useWiki'

export function WikiSyncPanel() {
  const config = useWikiConfig()
  const noteCount = useWikiNoteCount()
  const { showToast } = useToast()
  const [bridgeUrl, setBridgeUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [connected, setConnected] = useState(false)

  const effectiveUrl = bridgeUrl || config?.bridgeUrl || 'http://localhost:8787'

  const handleTest = async () => {
    setTesting(true)
    try {
      await connectAndTestWikiBridge({
        bridgeUrl: effectiveUrl,
        apiKey: apiKey || config?.apiKey || '',
        vaultName: config?.vaultName || '',
        lastSyncAt: config?.lastSyncAt || 0,
      })
      setConnected(true)
      showToast('Bridge 連線成功', 'success')
    } catch (err) {
      setConnected(false)
      showToast(err.message || '連線失敗', 'error')
    } finally {
      setTesting(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await runWikiSync()
      if (result.upToDate) {
        showToast('已是最新，無需同步', 'info')
      } else {
        showToast(`已同步 ${result.ingested} 篇筆記`, 'success')
      }
    } catch (err) {
      showToast(err.message || '同步失敗', 'error')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <section className="bento-card space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Plug size={18} className="text-accent" />
        <h2 className="text-sm font-semibold text-fg">Obsidian Bridge</h2>
        {connected && <CheckCircle2 size={16} className="text-success" />}
      </div>

      <p className="text-xs leading-relaxed text-muted">
        連接本機或 NAS 上的 Obsidian Bridge，讀取 Sync 下載的 vault 筆記，供 LLM Wiki 使用。
      </p>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-fg-2">Bridge URL</label>
          <input
            type="url"
            placeholder="http://localhost:8787"
            defaultValue={config?.bridgeUrl}
            onChange={(e) => setBridgeUrl(e.target.value)}
            className="input-field min-h-9 w-full px-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-fg-2">API Key（選填）</label>
          <input
            type="password"
            placeholder="OBSIDIAN_BRIDGE_API_KEY"
            defaultValue={config?.apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input-field min-h-9 w-full px-3 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="btn-ghost flex min-h-9 items-center gap-1.5 px-3 text-xs font-medium"
        >
          {testing ? <Loader2 size={14} className="animate-spin" /> : <Plug size={14} />}
          測試連線
        </button>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="flex min-h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-medium text-accent-on hover:bg-accent-hover disabled:opacity-60"
        >
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          立即同步
        </button>
      </div>

      <div className="border-t border-border pt-3 text-xs text-meta">
        <p>本地索引：{noteCount ?? 0} 篇筆記</p>
        {config?.lastSyncAt > 0 && (
          <p>上次同步：{new Date(config.lastSyncAt).toLocaleString()}</p>
        )}
      </div>
    </section>
  )
}
