import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanVault, getVaultMeta, filterNotesSince } from './vault/scanner.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_VAULT = path.resolve(__dirname, '../fixtures/sample-vault')

const PORT = Number(process.env.OBSIDIAN_BRIDGE_PORT || 8787)
const VAULT_PATH = path.resolve(process.env.OBSIDIAN_VAULT_PATH || DEFAULT_VAULT)
const API_KEY = process.env.OBSIDIAN_BRIDGE_API_KEY || ''
const CAPTURE_TOKEN = process.env.CAPTURE_TOKEN || ''
const EXCLUDE = (process.env.OBSIDIAN_BRIDGE_EXCLUDE || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const scanOptions = { exclude: EXCLUDE }

/** @type {{ notes: import('./vault/parser.js').parseMarkdownNote extends (...args: infer A) => infer R ? R[] : never, scannedAt: number } | null} */
let cache = null

/** @type {Array<{ id: string, text: string, source: string, capturedAt: number }>} */
const captureQueue = []

async function refreshCache() {
  const notes = await scanVault(VAULT_PATH, scanOptions)
  cache = { notes, scannedAt: Date.now() }
  return cache
}

async function getNotes() {
  if (!cache) await refreshCache()
  return cache.notes
}

function json(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400',
  }
}

function unauthorized(res, origin) {
  res.writeHead(401, { ...corsHeaders(origin), 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Unauthorized' }))
}

function checkAuth(req, origin) {
  if (!API_KEY) return true
  const headerKey = req.headers['x-api-key'] || req.headers.authorization?.replace(/^Bearer\s+/i, '')
  return headerKey === API_KEY
}

function checkCaptureAuth(req) {
  if (!CAPTURE_TOKEN) return true
  const headerKey = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  return headerKey === CAPTURE_TOKEN
}

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw)
}

async function handleRequest(req, res) {
  const origin = req.headers.origin || '*'
  const url = new URL(req.url || '/', `http://${req.headers.host}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin))
    res.end()
    return
  }

  if (req.method === 'POST' && url.pathname === '/capture') {
    if (!checkCaptureAuth(req)) {
      unauthorized(res, origin)
      return
    }
    try {
      const body = await readJsonBody(req)
      const text = String(body.text || '').trim()
      if (!text) {
        json(res, 400, { error: 'text is required' })
        return
      }
      const item = {
        id: crypto.randomUUID(),
        text,
        source: body.source || 'mobile',
        capturedAt: Date.now(),
      }
      captureQueue.push(item)
      json(res, 201, { ok: true, id: item.id })
    } catch (err) {
      json(res, 400, { error: err.message || 'Invalid JSON' })
    }
    return
  }

  if (req.method === 'GET' && url.pathname === '/capture/pending') {
    if (!checkCaptureAuth(req)) {
      unauthorized(res, origin)
      return
    }
    json(res, 200, { items: [...captureQueue], count: captureQueue.length })
    return
  }

  if (req.method === 'POST' && url.pathname === '/capture/ack') {
    if (!checkCaptureAuth(req)) {
      unauthorized(res, origin)
      return
    }
    try {
      const body = await readJsonBody(req)
      const ids = new Set(body.ids || [])
      const before = captureQueue.length
      for (let i = captureQueue.length - 1; i >= 0; i--) {
        if (ids.has(captureQueue[i].id)) captureQueue.splice(i, 1)
      }
      json(res, 200, { ok: true, removed: before - captureQueue.length })
    } catch (err) {
      json(res, 400, { error: err.message || 'Invalid JSON' })
    }
    return
  }

  if (!checkAuth(req, origin)) {
    unauthorized(res, origin)
    return
  }

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      json(res, 200, {
        ok: true,
        service: 'personal-os-obsidian-bridge',
        vaultPath: VAULT_PATH,
        version: '0.1.0',
      })
      return
    }

    if (req.method === 'POST' && url.pathname === '/vault/refresh') {
      await refreshCache()
      json(res, 200, { ok: true, scannedAt: cache.scannedAt, noteCount: cache.notes.length })
      return
    }

    if (req.method === 'GET' && url.pathname === '/vault/meta') {
      const meta = await getVaultMeta(VAULT_PATH, scanOptions)
      json(res, 200, meta)
      return
    }

    if (req.method === 'GET' && url.pathname === '/notes') {
      const since = url.searchParams.get('since')
      const limit = url.searchParams.get('limit')
      let notes = await getNotes()

      if (since) {
        notes = filterNotesSince(notes, Number(since))
      }

      const includeContent = url.searchParams.get('includeContent') === '1'
      const summary = notes.map((n) => {
        const base = {
          obsidianPath: n.obsidianPath,
          title: n.title,
          tags: n.tags,
          mtime: n.mtime,
          contentHash: n.contentHash,
        }
        if (includeContent) {
          return {
            ...base,
            content: n.content,
            frontmatter: n.frontmatter,
            wikilinks: n.wikilinks,
            wikilinkDetails: n.wikilinkDetails,
          }
        }
        return base
      })

      const sliced = limit ? summary.slice(0, Number(limit)) : summary
      json(res, 200, {
        notes: sliced,
        total: summary.length,
        scannedAt: cache?.scannedAt ?? null,
      })
      return
    }

    if (req.method === 'GET' && url.pathname.startsWith('/notes/')) {
      const encodedPath = url.pathname.slice('/notes/'.length)
      const obsidianPath = decodeURIComponent(encodedPath)
      const notes = await getNotes()
      const note = notes.find((n) => n.obsidianPath === obsidianPath)

      if (!note) {
        json(res, 404, { error: 'Note not found', obsidianPath })
        return
      }

      if (url.searchParams.get('links') === '1') {
        const noteTitle = note.title
        const noteBasename = titleFromBasename(obsidianPath)
        const outgoing = (note.wikilinkDetails || []).map((l) => ({
          target: l.target,
          alias: l.alias,
        }))
        const incoming = notes
          .filter((n) => n.obsidianPath !== obsidianPath)
          .filter((n) => n.wikilinks?.includes(noteTitle) || n.wikilinks?.includes(noteBasename))
          .map((n) => ({ obsidianPath: n.obsidianPath, title: n.title }))

        json(res, 200, { obsidianPath, outgoing, incoming })
        return
      }

      json(res, 200, note)
      return
    }

    json(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error('[bridge]', err)
    json(res, 500, { error: err.message || 'Internal server error' })
  }
}

function titleFromBasename(obsidianPath) {
  const base = obsidianPath.split('/').pop() || obsidianPath
  return base.replace(/\.md$/i, '')
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || '*'
  const headers = corsHeaders(origin)

  handleRequest(req, res).catch((err) => {
    console.error('[bridge]', err)
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Internal server error' }))
  })
})

await refreshCache()

server.listen(PORT, () => {
  console.info(`[obsidian-bridge] listening on http://localhost:${PORT}`)
  console.info(`[obsidian-bridge] vault: ${VAULT_PATH}`)
  console.info(`[obsidian-bridge] notes loaded: ${cache.notes.length}`)
})
