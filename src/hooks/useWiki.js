import { useLiveQuery } from 'dexie-react-hooks'
import { syncFromBridge, testBridgeConnection } from '../services/obsidian/bridgeClient'
import { db } from '../db/schema'
import { getWikiConfig, ingestWikiNotes, saveWikiConfig } from '../db/services/wiki'

const CONFIG_KEY = 'config'

const DEFAULT_CONFIG = {
  bridgeUrl: import.meta.env.VITE_OBSIDIAN_BRIDGE_URL || 'http://localhost:8787',
  apiKey: '',
  vaultName: '',
  lastSyncAt: 0,
}

export function useWikiConfig() {
  return useLiveQuery(async () => {
    const row = await db.wikiSyncState.get(CONFIG_KEY)
    return row?.value || DEFAULT_CONFIG
  }, [])
}

export function useWikiNotes() {
  return useLiveQuery(() => db.wikiNotes.orderBy('mtime').reverse().toArray(), [])
}

export function useWikiNoteCount() {
  return useLiveQuery(() => db.wikiNotes.count(), [])
}

export async function connectAndTestWikiBridge(config) {
  const health = await testBridgeConnection(config)
  await saveWikiConfig(config)
  return health
}

export async function runWikiSync() {
  const config = await getWikiConfig()
  const remoteNotes = await syncFromBridge(config)

  if (!remoteNotes.length) {
    return { ingested: 0, syncedAt: config.lastSyncAt, upToDate: true }
  }

  return ingestWikiNotes(remoteNotes)
}
