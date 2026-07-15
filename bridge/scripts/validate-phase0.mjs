#!/usr/bin/env node
/**
 * Phase 0 validation: scan sample vault and verify parser + note count.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanVault, getVaultMeta } from '../src/vault/scanner.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vaultRoot = path.resolve(__dirname, '../fixtures/sample-vault')

const meta = await getVaultMeta(vaultRoot)
const notes = await scanVault(vaultRoot)

console.info('=== Phase 0: Obsidian Vault Validation ===')
console.info(`Vault: ${vaultRoot}`)
console.info(`Note count: ${meta.noteCount}`)
console.info(`Latest mtime: ${new Date(meta.latestMtime).toISOString()}`)

if (notes.length < 10) {
  console.error(`FAIL: expected at least 10 notes, got ${notes.length}`)
  process.exit(1)
}

const index = notes.find((n) => n.title === 'Personal OS Wiki')
if (!index?.wikilinks?.includes('Getting Started')) {
  console.error('FAIL: wikilink parsing broken on index note')
  process.exit(1)
}

const withTags = notes.filter((n) => n.tags.length > 0)
if (withTags.length < 8) {
  console.error(`FAIL: expected tag extraction on most notes, got ${withTags.length}`)
  process.exit(1)
}

console.info('\nSample notes:')
for (const note of notes.slice(0, 3)) {
  console.info(`  - ${note.obsidianPath} (${note.tags.length} tags, ${note.wikilinks.length} links)`)
}

console.info('\nPASS: Phase 0 validation complete')
process.exit(0)
