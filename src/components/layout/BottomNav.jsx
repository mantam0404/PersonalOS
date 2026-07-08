import { NavLink } from 'react-router-dom'
import { CalendarDays, Zap, BookOpen, Layers } from 'lucide-react'

const tabs = [
  { to: '/', icon: CalendarDays, label: '今日' },
  { to: '/capture', icon: Zap, label: '捕捉' },
  { to: '/study', icon: BookOpen, label: '學習' },
  { to: '/domains', icon: Layers, label: '領域' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-3xl">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                isActive
                  ? 'text-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
