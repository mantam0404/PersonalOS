import { Command } from 'lucide-react'
import { useIsMac } from '../../hooks/useIsMac'

export function ModKShortcut({ className = '' }) {
  const isMac = useIsMac()

  return (
    <kbd
      className={`inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-meta ${className}`}
    >
      {isMac ? <Command size={10} /> : <span>Ctrl</span>}
      K
    </kbd>
  )
}
