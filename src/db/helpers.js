export function createId() {
  return crypto.randomUUID()
}

export function touchTimestamp(entity) {
  return { ...entity, lastTouchedAt: Date.now() }
}

export function startOfDay(ts = Date.now()) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function daysSince(ts) {
  if (!ts) return Infinity
  return Math.floor((Date.now() - ts) / 86400000)
}

export function isSameDay(a, b) {
  return startOfDay(a) === startOfDay(b)
}

export function subDays(ts, days) {
  return startOfDay(ts) - days * MS_PER_DAY
}

export function seededPick(items, seed) {
  if (!items.length) return null
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return items[Math.abs(hash) % items.length]
}

export const SLIPPING_DAYS = 5
export const MAX_DAILY_HIGHLIGHTS = 3
export const MS_PER_DAY = 86400000
