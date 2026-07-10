import { NavLink } from 'react-router-dom'
import { NAV_TABS } from './navTabs'

export function BottomNav() {
  return (
    <nav
      className="vercel-nav fixed bottom-0 left-0 right-0 z-50 border-b-0 border-t md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-container">
        {NAV_TABS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-tab nav-tab-bottom flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
                isActive ? 'nav-tab-active' : ''
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
