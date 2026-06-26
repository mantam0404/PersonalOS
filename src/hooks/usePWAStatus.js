import { useState, useEffect, useCallback } from 'react'

export function usePWAStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [isInstallable, setIsInstallable] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }
    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsInstallable(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
      setIsInstallable(false)
    }
    return outcome === 'accepted'
  }, [installPrompt])

  return { isOnline, isInstallable, promptInstall }
}
