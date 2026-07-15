import { db } from '../schema'
import { createId } from '../helpers'

const CONFIG_KEY = 'config'

export async function pathToWikiId(obsidianPath) {
  const data = new TextEncoder().encode(obsidianPath)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

export async function getWikiConfig() {
  const row = await db.wikiSyncState.get(CONFIG_KEY)
  return (
    row?.value || {
      bridgeUrl: import.meta.env.VITE_OBSIDIAN_BRIDGE_URL || 'http://localhost:8787',
      apiKey: '',
      vaultName: '',
      lastSyncAt: 0,
    }
  )
}

export async function saveWikiConfig(config) {
  await db.wikiSyncState.put({
    key: CONFIG_KEY,
    value: { ...(await getWikiConfig()), ...config },
  })
}

export async function getWikiNotes() {
  return db.wikiNotes.orderBy('mtime').reverse().toArray()
}

export async function getWikiNoteByPath(obsidianPath) {
  return db.wikiNotes.where('obsidianPath').equals(obsidianPath).first()
}

export async function ingestWikiNotes(notesFromBridge) {
  const now = Date.now()
  const linkRows = []

  await db.transaction('rw', db.wikiNotes, db.wikiLinks, db.wikiSyncState, async () => {
    for (const remote of notesFromBridge) {
      const id = await pathToWikiId(remote.obsidianPath)
      await db.wikiNotes.put({
        id,
        obsidianPath: remote.obsidianPath,
        title: remote.title,
        content: remote.content || '',
        frontmatter: remote.frontmatter || {},
        tags: remote.tags || [],
        wikilinks: remote.wikilinks || [],
        contentHash: remote.contentHash,
        mtime: remote.mtime,
        syncedAt: now,
      })

      for (const target of remote.wikilinks || []) {
        linkRows.push({
          id: createId(),
          sourcePath: remote.obsidianPath,
          targetPath: target,
          type: 'wikilink',
        })
      }
    }

    const paths = new Set(notesFromBridge.map((n) => n.obsidianPath))
    if (paths.size > 0) {
      await db.wikiLinks.where('sourcePath').anyOf([...paths]).delete()
    }
    if (linkRows.length) {
      await db.wikiLinks.bulkAdd(linkRows)
    }

    const config = await getWikiConfig()
    const maxMtime = notesFromBridge.reduce((max, n) => Math.max(max, n.mtime || 0), 0)
    await db.wikiSyncState.put({
      key: CONFIG_KEY,
      value: {
        ...config,
        lastSyncAt: maxMtime || now,
        noteCount: await db.wikiNotes.count(),
      },
    })
  })

  return { ingested: notesFromBridge.length, syncedAt: now }
}

export async function searchWikiNotes(query, limit = 20) {
  const q = query.trim().toLowerCase()
  if (!q) return getWikiNotes()

  const all = await db.wikiNotes.toArray()
  return all
    .filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q)),
    )
    .slice(0, limit)
}
