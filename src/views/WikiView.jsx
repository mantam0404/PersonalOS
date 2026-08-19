import { WikiSyncPanel } from '../components/wiki/WikiSyncPanel'
import { WikiNoteList } from '../components/wiki/WikiNoteList'

export function WikiView() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Wiki</h1>
        <p className="page-subtitle">
          從 Obsidian vault 同步筆記，作為 LLM 知識庫基礎（Phase 0–1）
        </p>
      </header>

      <WikiSyncPanel />
      <WikiNoteList />
    </div>
  )
}
