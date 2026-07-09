const clientId = process.env.VITE_GOOGLE_CLIENT_ID || ''
const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI || 'http://127.0.0.1:5173'
const scope = 'https://www.googleapis.com/auth/calendar.readonly'

async function probe(responseType, extra = {}) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope,
    prompt: 'consent',
    ...extra,
  })
  const res = await fetch(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, { redirect: 'follow' })
  const text = await res.text()
  const mismatch = text.includes('redirect_uri_mismatch') || res.url.includes('redirect_uri_mismatch')
  return { responseType, mismatch, status: res.status, url: res.url }
}

if (!clientId) {
  console.error('Missing VITE_GOOGLE_CLIENT_ID')
  process.exit(1)
}

console.log('redirect_uri:', redirectUri)
console.log('token flow:', await probe('token'))
console.log('code flow:', await probe('code'))
