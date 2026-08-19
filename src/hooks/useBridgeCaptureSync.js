import { useEffect } from 'react'
import { pollBridgeCaptures } from '../services/obsidian/bridgeClient'

export function useBridgeCaptureSync() {
  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      if (cancelled) return
      try {
        await pollBridgeCaptures()
      } catch (err) {
        console.debug('[BridgeCapture] sync skipped', err.message)
      }
    }

    sync()
    const interval = setInterval(sync, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])
}
