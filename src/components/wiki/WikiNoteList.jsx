import { useMemo, useState } from 'react'
import { BookOpen, Search, Link2 } from 'lucide-react'
import Markdown from 'react-markdown'
import { useWikiNotes } from '../../hooks/useWiki'
import { searchWikiNotes } from '../../db/services/wiki'

export function WikiNoteList() {
  const notes = useWikiNotes()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)

  const displayed = searchResults ?? notes

  const selected = useMemo(
    () => displayed?.find((n) => n.id === selectedId) || null,
    [displayed, selectedId],
  )

  const handleSearch = async (e) => {
    e.preventDefault()
    setSearching(true)
    try {
      const results = await searchWikiNotes(query)
      setSearchResults(results)
      setSelectedId(null)
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSearchResults(null)
    setSelectedId(null)
  }

  if (notes === undefined) return null

  return (
    <section className="space-y-4">
      <form onSubmit={handleSearch} className="bento-card flex items-center gap-2 p-2">
        <Search size={16} className="shrink-0 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋 Obsidian 筆記..."
          className="min-h-9 flex-1 bg-transparent text-sm text-fg placeholder:text-muted outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-md bg-surface px-3 py-1.5 text-xs text-fg-2 hover:bg-surface-elevated"
        >
          搜尋
        </button>
        {searchResults && (
          <button type="button" onClick={clearSearch} className="text-xs text-muted hover:text-fg">
            清除
          </button>
        )}
      </form>

      {!displayed?.length ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
          尚無 Obsidian 筆記 — 連接 Bridge 並同步
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ul className="max-h-[480px] space-y-2 overflow-y-auto">
            {displayed.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={`bento-card w-full p-3 text-left transition-colors hover:bg-surface-elevated ${
                    selectedId === note.id ? 'ring-1 ring-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <BookOpen size={16} className="mt-0.5 shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{note.title}</p>
                      <p className="truncate text-xs text-meta">{note.obsidianPath}</p>
                      {note.tags?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {note.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="bento-card min-h-[240px] p-4 lg:sticky lg:top-20 lg:max-h-[480px] lg:overflow-y-auto">
            {!selected ? (
              <p className="text-sm text-muted">選擇一篇筆記預覽</p>
            ) : (
              <article className="space-y-3">
                <header>
                  <h3 className="text-base font-semibold text-fg">{selected.title}</h3>
                  <p className="text-xs text-meta">{selected.obsidianPath}</p>
                </header>
                {selected.wikilinks?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 text-xs text-muted">
                    <Link2 size={12} />
                    {selected.wikilinks.slice(0, 6).map((link) => (
                      <span key={link} className="rounded bg-surface px-1.5 py-0.5">
                        [[{link}]]
                      </span>
                    ))}
                  </div>
                )}
                <div className="prose prose-sm max-w-none text-fg dark:prose-invert">
                  <Markdown>{selected.content || '_（無內容）_'}</Markdown>
                </div>
              </article>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
