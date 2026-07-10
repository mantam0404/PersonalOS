import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed left-0 right-0 top-16 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm rounded-md border px-4 py-3 text-sm font-medium shadow-raised backdrop-blur-md ${
              t.type === 'success'
                ? 'border-success/30 bg-success/90 text-white'
                : t.type === 'error'
                  ? 'border-danger/30 bg-danger/90 text-white'
                  : 'border-border bg-surface-elevated/95 text-fg'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function emitToast(message, type = 'info') {
  window.dispatchEvent(
    new CustomEvent('personal-os:toast', { detail: { message, type } }),
  )
}
