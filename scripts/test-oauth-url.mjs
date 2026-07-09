const clientId = process.env.VITE_GOOGLE_CLIENT_ID || ''
const configuredRedirect = process.env.VITE_GOOGLE_REDIRECT_URI || ''
const scope = 'https://www.googleapis.com/auth/calendar.readonly'

function buildAuthUrl(redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope,
    include_granted_scopes: 'true',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

async function checkRedirectUri(redirectUri) {
  const response = await fetch(buildAuthUrl(redirectUri), { redirect: 'manual' })
  const body = response.status === 200 ? await response.text() : ''
  const location = response.headers.get('location') || ''

  const mismatch = body.includes('redirect_uri_mismatch')
    || location.includes('redirect_uri_mismatch')
    || body.includes('Error 400: redirect_uri_mismatch')

  return {
    redirectUri,
    status: response.status,
    ok: !mismatch,
    mismatch,
  }
}

if (!clientId) {
  console.error('Missing VITE_GOOGLE_CLIENT_ID')
  process.exit(1)
}

const hints = new Set([
  configuredRedirect.replace(/\/$/, ''),
  'http://127.0.0.1:5173',
  'http://localhost:5173',
].filter(Boolean))

const results = []
for (const uri of hints) {
  results.push(await checkRedirectUri(uri))
}

const working = results.filter((r) => r.ok)
const failing = results.filter((r) => !r.ok)

console.log('OAuth redirect URI probe:')
for (const result of results) {
  console.log(`- ${result.ok ? 'OK' : 'FAIL'} ${result.redirectUri} (HTTP ${result.status})`)
}

if (working.length === 0) {
  console.error('\nNo redirect URI accepted by Google for this client ID.')
  console.error('Add these to Authorized redirect URIs in Google Cloud Console:')
  for (const uri of hints) console.error(`  ${uri}`)
  process.exit(1)
}

console.log(`\nRecommended VITE_GOOGLE_REDIRECT_URI=${working[0].redirectUri}`)
