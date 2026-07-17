import { WikiSyncPanel } from '../components/wiki/WikiSyncPanel'
import { WikiNoteList } from '../components/wiki/WikiNoteList'
import { WikiAskPanel } from '../components/wiki/WikiAskPanel'

export function WikiView() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Wiki</h1>
        <p className="page-subtitle">
          從 Obsidian vault 同步筆記，作為 LLM 知識庫基礎
        </p>
      </header>

      <WikiSyncPanel />
      <WikiAskPanel />
      <WikiNoteList />
    </div>
  )
}
