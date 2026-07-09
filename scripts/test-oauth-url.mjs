const clientId = process.env.VITE_GOOGLE_CLIENT_ID || ''
const scope = 'https://www.googleapis.com/auth/calendar.readonly'

async function probeRedirectUri(uri, responseType = 'code') {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: uri,
    response_type: responseType,
    scope,
    prompt: 'consent',
  })
  const res = await fetch(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, { redirect: 'follow' })
  const text = await res.text()
  const mismatch = text.includes('redirect_uri_mismatch') || res.url.includes('redirect_uri_mismatch')
  return { uri, responseType, ok: !mismatch }
}

if (!clientId) {
  console.error('Missing VITE_GOOGLE_CLIENT_ID')
  process.exit(1)
}

const checks = [
  await probeRedirectUri('http://127.0.0.1:5173', 'token'),
  await probeRedirectUri('http://127.0.0.1:5173', 'code'),
  await probeRedirectUri('postmessage', 'code'),
]

console.log('OAuth client redirect URI registration probe:')
for (const check of checks) {
  console.log(`- ${check.ok ? 'OK' : 'FAIL'} ${check.responseType} redirect_uri=${check.uri}`)
}

const hasLoopback = checks.slice(0, 2).some((c) => c.ok)
if (!hasLoopback) {
  console.log('\nThis client ID has no loopback redirect URI registered.')
  console.log('Use GIS Token Client (JavaScript origins) instead of manual redirect OAuth.')
}
