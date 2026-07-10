import { NavLink } from 'react-router-dom'
import { Wifi, WifiOff, Download, Sun, Moon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { usePWAStatus } from '../hooks/usePWAStatus'
import { BackupMenu } from './ui/BackupMenu'
import { NAV_TABS } from './layout/navTabs'

export function Navbar() {
  const { theme, cycleTheme } = useApp()
  const { isOnline, isInstallable, promptInstall } = usePWAStatus()

  const ThemeIcon = theme === 'light' ? Sun : Moon
  const themeLabel = theme === 'light' ? '淺色' : '深色'

  return (
    <header className="vercel-nav sticky top-0 z-50">
      <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-3 py-3 sm:px-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-xs font-bold text-fg">
              OS
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold leading-tight text-fg">Personal OS</h1>
              <p className="text-xs text-meta">行動流水線</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_TABS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-tab px-3 py-2 text-sm ${isActive ? 'nav-tab-active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span
            className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium ${
              isOnline ? 'text-success' : 'text-warn'
            }`}
            title={isOnline ? '已連線' : '離線模式'}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="hidden sm:inline">{isOnline ? '線上' : '離線'}</span>
          </span>

          {isInstallable && (
            <button
              type="button"
              onClick={promptInstall}
              className="flex items-center gap-1 rounded-md bg-accent px-2 py-1.5 text-xs font-medium text-accent-on hover:bg-accent-hover"
            >
              <Download size={14} />
              <span className="hidden sm:inline">安裝</span>
            </button>
          )}

          <BackupMenu />

          <button
            type="button"
            onClick={cycleTheme}
            className="rounded-md p-2 text-muted transition-colors hover:bg-surface hover:text-fg"
            aria-label={`切換主題（目前：${themeLabel}）`}
            title={`切換為${theme === 'light' ? '深色' : '淺色'}模式`}
          >
            <ThemeIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
