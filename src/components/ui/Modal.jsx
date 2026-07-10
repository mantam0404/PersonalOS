import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bento-card relative z-10 w-full max-w-md rounded-t-2xl p-6 shadow-raised sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-fg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted transition-colors hover:bg-surface-elevated hover:text-fg"
            aria-label="關閉"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
