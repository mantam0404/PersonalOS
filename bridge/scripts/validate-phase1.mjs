#!/usr/bin/env node
/**
 * Phase 1 validation: start bridge expectations against running server or spawn check.
 * Usage: npm run bridge (separate terminal) then node bridge/scripts/validate-phase1.mjs
 */
const BASE = process.env.OBSIDIAN_BRIDGE_URL || 'http://localhost:8787'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json()
}

console.info('=== Phase 1: Bridge API Validation ===')
console.info(`Base URL: ${BASE}`)

const health = await get('/health')
if (!health.ok) throw new Error('health check failed')
console.info('GET /health OK')

const meta = await get('/vault/meta')
if (meta.noteCount < 10) throw new Error(`expected >= 10 notes, got ${meta.noteCount}`)
console.info(`GET /vault/meta OK (${meta.noteCount} notes)`)

const list = await get('/notes?includeContent=1&limit=3')
if (!list.notes?.length) throw new Error('notes list empty')
console.info(`GET /notes OK (${list.notes.length} returned)`)

const path = encodeURIComponent(list.notes[0].obsidianPath)
const note = await get(`/notes/${path}`)
if (!note.content) throw new Error('single note missing content')
console.info(`GET /notes/:path OK (${note.title})`)

const links = await get(`/notes/${path}?links=1`)
if (!Array.isArray(links.outgoing)) throw new Error('links endpoint broken')
console.info(`GET /notes/:path?links=1 OK (${links.outgoing.length} outgoing)`)

console.info('\nPASS: Phase 1 API validation complete')
