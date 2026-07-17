import { db } from '../schema'

const CAPTURE_TOKEN_KEY = 'captureToken'
const SLIPPING_DAYS_KEY = 'slippingDays'

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function getSetting(key, fallback = null) {
  const row = await db.appSettings.get(key)
  return row?.value ?? fallback
}

export async function setSetting(key, value) {
  await db.appSettings.put({ key, value, updatedAt: Date.now() })
}

export async function getCaptureToken() {
  let token = await getSetting(CAPTURE_TOKEN_KEY)
  if (!token) {
    token = randomToken()
    await setSetting(CAPTURE_TOKEN_KEY, token)
  }
  return token
}

export async function regenerateCaptureToken() {
  const token = randomToken()
  await setSetting(CAPTURE_TOKEN_KEY, token)
  return token
}

export async function getSlippingDays() {
  const days = await getSetting(SLIPPING_DAYS_KEY)
  return typeof days === 'number' ? days : null
}

export async function setSlippingDays(days) {
  await setSetting(SLIPPING_DAYS_KEY, days)
}
