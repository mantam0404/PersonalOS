import { createHash } from 'node:crypto'

const WIKILINK_RE = /\[\[([^\]|#]+?)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g
const TAG_RE = /#([\w\u4e00-\u9fff-]+)/g
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

function parseSimpleYaml(yaml) {
  const result = {}
  if (!yaml?.trim()) return result

  for (const line of yaml.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const colon = trimmed.indexOf(':')
    if (colon === -1) continue
    const key = trimmed.slice(0, colon).trim()
    let value = trimmed.slice(colon + 1).trim()
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      value = value.replace(/^['"]|['"]$/g, '')
    }
    result[key] = value
  }
  return result
}

export function extractWikilinks(content) {
  const links = []
  for (const match of content.matchAll(WIKILINK_RE)) {
    links.push({
      target: match[1].trim(),
      alias: match[2]?.trim() || null,
    })
  }
  return links
}

export function extractTags(content, frontmatter = {}) {
  const tags = new Set()
  for (const match of content.matchAll(TAG_RE)) {
    tags.add(match[1])
  }
  if (Array.isArray(frontmatter.tags)) {
    frontmatter.tags.forEach((t) => tags.add(String(t)))
  } else if (typeof frontmatter.tags === 'string') {
    frontmatter.tags.split(/[\s,]+/).forEach((t) => tags.add(t))
  }
  return [...tags]
}

export function splitFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) {
    return { frontmatter: {}, body: raw }
  }
  return {
    frontmatter: parseSimpleYaml(match[1]),
    body: raw.slice(match[0].length),
  }
}

export function titleFromPath(obsidianPath) {
  const base = obsidianPath.split('/').pop() || obsidianPath
  return base.replace(/\.md$/i, '')
}

export function hashContent(content) {
  return createHash('sha256').update(content).digest('hex')
}

export function parseMarkdownNote(obsidianPath, rawContent, mtimeMs) {
  const { frontmatter, body } = splitFrontmatter(rawContent)
  const wikilinks = extractWikilinks(body)
  const tags = extractTags(body, frontmatter)
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title.trim()) ||
    titleFromPath(obsidianPath)

  return {
    obsidianPath,
    title,
    content: body.trim(),
    frontmatter,
    tags,
    wikilinks: wikilinks.map((l) => l.target),
    wikilinkDetails: wikilinks,
    contentHash: hashContent(rawContent),
    mtime: mtimeMs,
  }
}
