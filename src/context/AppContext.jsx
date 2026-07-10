import { createContext, useContext, useEffect, useState } from 'react'

const THEME_KEY = 'personal-os-theme'

const THEME_COLORS = {
  light: '#ffffff',
  dark: '#0a0a0a',
}

const AppContext = createContext(null)

function normalizeTheme(stored) {
  return stored === 'light' ? 'light' : 'dark'
}

function applyThemeClass(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  root.style.colorScheme = theme

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', THEME_COLORS[theme])
  }
}

export function AppProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY) || 'dark'
    const normalized = normalizeTheme(stored)
    if (stored !== normalized) {
      localStorage.setItem(THEME_KEY, normalized)
    }
    return normalized
  })

  useEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  const setTheme = (next) => {
    const normalized = normalizeTheme(next)
    setThemeState(normalized)
    localStorage.setItem(THEME_KEY, normalized)
  }

  const cycleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <AppContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
