import { useState, useEffect } from 'react'

function detectMac() {
  if (typeof navigator === 'undefined') return false
  const platform = navigator.userAgentData?.platform ?? navigator.platform ?? ''
  return /Mac|iPhone|iPad|iPod/i.test(platform)
}

export function useIsMac() {
  const [isMac, setIsMac] = useState(detectMac)

  useEffect(() => {
    setIsMac(detectMac())
  }, [])

  return isMac
}
