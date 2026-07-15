import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { parseMarkdownNote } from './parser.js'

const SKIP_DIRS = new Set(['.obsidian', '.trash', '.git', 'node_modules'])
const MARKDOWN_EXT = /\.md$/i

function normalizePath(relativePath) {
  return relativePath.split(path.sep).join('/')
}

export async function walkMarkdownFiles(vaultRoot, { exclude = [] } = {}) {
  const excludeSet = new Set(exclude.map((p) => p.replace(/\\/g, '/')))
  const files = []

  async function walk(dir) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue
        const rel = normalizePath(path.relative(vaultRoot, fullPath))
        if (excludeSet.has(rel)) continue
        await walk(fullPath)
        continue
      }

      if (!MARKDOWN_EXT.test(entry.name)) continue
      const obsidianPath = normalizePath(path.relative(vaultRoot, fullPath))
      if (excludeSet.has(obsidianPath)) continue
      files.push({ fullPath, obsidianPath })
    }
  }

  await walk(vaultRoot)
  files.sort((a, b) => a.obsidianPath.localeCompare(b.obsidianPath))
  return files
}

export async function scanVault(vaultRoot, options = {}) {
  const fileRefs = await walkMarkdownFiles(vaultRoot, options)
  const notes = []

  for (const { fullPath, obsidianPath } of fileRefs) {
    const [raw, fileStat] = await Promise.all([
      readFile(fullPath, 'utf8'),
      stat(fullPath),
    ])
    notes.push(parseMarkdownNote(obsidianPath, raw, fileStat.mtimeMs))
  }

  return notes
}

export async function getVaultMeta(vaultRoot, options = {}) {
  const notes = await scanVault(vaultRoot, options)
  const latestMtime = notes.reduce((max, n) => Math.max(max, n.mtime), 0)
  return {
    vaultRoot,
    noteCount: notes.length,
    latestMtime,
    scannedAt: Date.now(),
  }
}

export function filterNotesSince(notes, sinceMs) {
  if (!sinceMs || Number.isNaN(sinceMs)) return notes
  return notes.filter((n) => n.mtime > sinceMs)
}
