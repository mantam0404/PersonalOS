export function fuzzyMatch(query, candidates, { key = 'name', limit = 5 } = {}) {
  if (!query?.trim()) return []
  const q = query.trim().toLowerCase()

  return candidates
    .map((item) => {
      const text = String(item[key] || '').toLowerCase()
      let score = 0
      if (text === q) score = 100
      else if (text.includes(q)) score = 80
      else if (q.includes(text) && text.length > 2) score = 60
      else {
        const words = q.split(/\s+/)
        score = words.filter((w) => text.includes(w)).length * 20
      }
      return { item, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item)
}

export function resolveSingleMatch(query, candidates, key = 'name') {
  const matches = fuzzyMatch(query, candidates, { key, limit: 2 })
  if (matches.length === 1) return { match: matches[0], ambiguous: false }
  if (matches.length > 1 && matches[0].name?.toLowerCase() === matches[1].name?.toLowerCase()) {
    return { match: matches[0], ambiguous: false }
  }
  if (matches.length > 1) return { match: null, ambiguous: true, candidates: matches }
  return { match: null, ambiguous: false }
}
