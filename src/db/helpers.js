export function createId() {
  return crypto.randomUUID()
}

export function touchTimestamp(entity) {
  return { ...entity, lastTouchedAt: Date.now() }
}
