#!/usr/bin/env node
/**
 * Phase D validation: bridge capture queue endpoints.
 * Usage: npm run bridge (separate terminal) then node bridge/scripts/validate-capture.mjs
 */
const BASE = process.env.OBSIDIAN_BRIDGE_URL || 'http://localhost:8787'
const TOKEN = process.env.CAPTURE_TOKEN || ''

async function request(method, path, body) {
  const headers = { Accept: 'application/json' }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${data.error || 'failed'}`)
  return data
}

console.info('=== Phase D: Capture API Validation ===')
console.info(`Base URL: ${BASE}`)

const created = await request('POST', '/capture', { text: '測試行動捕捉', source: 'mobile' })
if (!created.id) throw new Error('POST /capture missing id')
console.info('POST /capture OK')

const pending = await request('GET', '/capture/pending')
if (!pending.items?.length) throw new Error('GET /capture/pending empty')
console.info(`GET /capture/pending OK (${pending.items.length} items)`)

const ack = await request('POST', '/capture/ack', { ids: [created.id] })
if (!ack.ok) throw new Error('POST /capture/ack failed')
console.info('POST /capture/ack OK')

const after = await request('GET', '/capture/pending')
if (after.items?.length) throw new Error('queue not cleared after ack')
console.info('Queue cleared OK')

console.info('\nPASS: Phase D capture validation complete')
