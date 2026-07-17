const DEFAULT_BRIDGE_URL = import.meta.env.VITE_OBSIDIAN_BRIDGE_URL || 'http://localhost:8787'

function buildHeaders(apiKey) {
  const headers = { Accept: 'application/json' }
  if (apiKey) headers['X-API-Key'] = apiKey
  return headers
}

async function bridgeFetch(baseUrl, path, { apiKey = '', method = 'GET' } = {}) {
  const url = `${baseUrl.replace(/\/$/, '')}${path}`
  const response = await fetch(url, {
    method,
    headers: buildHeaders(apiKey),
  })

  if (!response.ok) {
    let message = `Bridge error ${response.status}`
    try {
      const body = await response.json()
      message = body.error || message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  return response.json()
}

export async function testBridgeConnection({ bridgeUrl, apiKey } = {}) {
  const baseUrl = bridgeUrl || DEFAULT_BRIDGE_URL
  return bridgeFetch(baseUrl, '/health', { apiKey })
}

export async function fetchVaultMeta({ bridgeUrl, apiKey } = {}) {
  const baseUrl = bridgeUrl || DEFAULT_BRIDGE_URL
  return bridgeFetch(baseUrl, '/vault/meta', { apiKey })
}

export async function fetchNotesFromBridge({ bridgeUrl, apiKey, since = 0, includeContent = true } = {}) {
  const baseUrl = bridgeUrl || DEFAULT_BRIDGE_URL
  const params = new URLSearchParams()
  if (since > 0) params.set('since', String(since))
  if (includeContent) params.set('includeContent', '1')
  const qs = params.toString()
  const data = await bridgeFetch(baseUrl, `/notes${qs ? `?${qs}` : ''}`, { apiKey })
  return data.notes || []
}

export async function fetchNoteFromBridge(obsidianPath, { bridgeUrl, apiKey } = {}) {
  const baseUrl = bridgeUrl || DEFAULT_BRIDGE_URL
  return bridgeFetch(baseUrl, `/notes/${encodeURIComponent(obsidianPath)}`, { apiKey })
}

export async function refreshBridgeCache({ bridgeUrl, apiKey } = {}) {
  const baseUrl = bridgeUrl || DEFAULT_BRIDGE_URL
  return bridgeFetch(baseUrl, '/vault/refresh', { apiKey, method: 'POST' })
}

export async function syncFromBridge(config) {
  const { bridgeUrl, apiKey, lastSyncAt = 0 } = config
  await refreshBridgeCache({ bridgeUrl, apiKey })
  return fetchNotesFromBridge({
    bridgeUrl,
    apiKey,
    since: lastSyncAt,
    includeContent: true,
  })
}

export async function pollBridgeCaptures({ bridgeUrl, captureToken } = {}) {
  const baseUrl = bridgeUrl || DEFAULT_BRIDGE_URL
  const { getCaptureToken } = await import('../../db/services/appSettings')
  const token = captureToken || (await getCaptureToken())

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/capture/pending`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 404) return { imported: 0 }
    throw new Error(`Bridge capture poll failed: ${response.status}`)
  }

  const data = await response.json()
  const items = data.items || []
  if (!items.length) return { imported: 0 }

  const { addInboxItem, CAPTURE_TYPE } = await import('../../db')
  let imported = 0

  for (const item of items) {
    if (item.text?.trim()) {
      await addInboxItem(item.text.trim(), item.source === 'mobile' ? CAPTURE_TYPE.TEXT : CAPTURE_TYPE.VOICE)
      imported++
    }
  }

  if (imported > 0) {
    await fetch(`${baseUrl.replace(/\/$/, '')}/capture/ack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: items.map((i) => i.id) }),
    })
  }

  return { imported }
}

