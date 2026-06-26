import { createContext, useContext, useEffect, useState } from 'react'

const THEME_KEY = 'personal-os-theme'

const AppContext = createContext(null)

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme) {
  if (theme === 'system') return getSystemTheme()
  return theme
}

export function AppProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark'
  })

  const resolvedTheme = resolveTheme(theme)

  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const root = document.documentElement
      if (media.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (next) => {
    setThemeState(next)
    localStorage.setItem(THEME_KEY, next)
  }

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system']
    const idx = order.indexOf(theme)
    setTheme(order[(idx + 1) % order.length])
  }

  return (
    <AppContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
