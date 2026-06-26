import { useCallback, useEffect } from 'react'
import { getAllData } from '../db'

export function useSyncData() {
  const syncData = useCallback(async () => {
    const data = await getAllData()
    console.info('[PersonalOS] syncData() — ready for cloud sync', {
      inbox: data.inbox.length,
      tasks: data.tasks.length,
      projects: data.projects.length,
    })
    return data
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      syncData()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [syncData])

  return { syncData }
}
