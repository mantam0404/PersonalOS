import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '../Navbar'
import { BottomNav } from './BottomNav'
import { CaptureFab } from '../capture/CaptureFab'

export function AppShell() {
  const { pathname } = useLocation()
  const showCaptureFab = pathname !== '/'

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <main className="mx-auto max-w-container px-3 py-5 pb-28 sm:px-4 md:px-6 md:py-6">
        <Outlet />
      </main>
      {showCaptureFab && <CaptureFab />}
      <BottomNav />
    </div>
  )
}
