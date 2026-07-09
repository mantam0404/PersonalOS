import { useEffect } from 'react'
import { useToast } from '../../context/ToastContext'

export function ToastListener() {
  const { showToast } = useToast()

  useEffect(() => {
    const handler = (e) => {
      const { message, type } = e.detail || {}
      if (message) showToast(message, type)
    }
    window.addEventListener('personal-os:toast', handler)
    return () => window.removeEventListener('personal-os:toast', handler)
  }, [showToast])

  return null
}
