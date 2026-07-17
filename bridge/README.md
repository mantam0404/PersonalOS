# Personal OS — Obsidian Bridge

Read-only HTTP bridge that scans a local Obsidian vault (synced via [Obsidian Headless](https://obsidian.md/help/headless)) and exposes notes to Personal OS for Wiki / LLM ingest.

## Phase 0 — Validate parser

```bash
npm run bridge:validate
```

Uses `bridge/fixtures/sample-vault/` (10 sample notes).

## Phase 1 — Run bridge

```bash
# Sample vault (default)
npm run bridge

# Your synced vault
OBSIDIAN_VAULT_PATH=/path/to/vault npm run bridge
```

Server: `http://localhost:8787`

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `OBSIDIAN_VAULT_PATH` | `fixtures/sample-vault` | Local vault directory |
| `OBSIDIAN_BRIDGE_PORT` | `8787` | HTTP port |
| `OBSIDIAN_BRIDGE_API_KEY` | _(empty)_ | Optional API key |
| `OBSIDIAN_BRIDGE_EXCLUDE` | _(empty)_ | Comma-separated folder paths to skip |

### API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/vault/meta` | Note count, latest mtime |
| POST | `/vault/refresh` | Rescan vault |
| GET | `/notes?since=&includeContent=1` | List notes (incremental) |
| GET | `/notes/:path` | Single note |
| GET | `/notes/:path?links=1` | Wikilink graph for note |

## Connect Personal OS

1. Start bridge: `npm run bridge`
2. Open Personal OS → **Wiki** tab
3. Bridge URL: `http://localhost:8787`
4. **測試連線** → **立即同步**

## Obsidian Sync (production vault)

```bash
npm install -g obsidian-headless
ob login
ob sync-setup --vault "My Vault"
ob sync --continuous
```

Point `OBSIDIAN_VAULT_PATH` at the synced folder.
