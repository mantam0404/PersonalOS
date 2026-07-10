import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export function CaptureFab() {
  return (
    <Link
      to="/capture"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-on shadow-raised transition-transform hover:scale-105 active:scale-95"
      aria-label="快速捕捉"
    >
      <Zap size={24} />
    </Link>
  )
}
