import { Outlet } from 'react-router-dom'
import { Navbar } from '../Navbar'
import { BottomNav } from './BottomNav'
import { CaptureFab } from '../capture/CaptureFab'

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 pb-28">
        <Outlet />
      </main>
      <CaptureFab />
      <BottomNav />
    </div>
  )
}
