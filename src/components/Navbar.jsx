import { Wifi, WifiOff, Download, Sun, Moon, Monitor } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { usePWAStatus } from '../hooks/usePWAStatus'

export function Navbar() {
  const { theme, cycleTheme } = useApp()
  const { isOnline, isInstallable, promptInstall } = usePWAStatus()

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            OS
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight text-slate-100">Personal OS</h1>
            <p className="text-xs text-slate-500">行動流水線</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium ${
              isOnline ? 'text-green-400' : 'text-amber-400'
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
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              <Download size={14} />
              <span className="hidden sm:inline">安裝</span>
            </button>
          )}

          <button
            type="button"
            onClick={cycleTheme}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            aria-label="切換主題"
          >
            <ThemeIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
