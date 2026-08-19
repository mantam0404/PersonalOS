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
