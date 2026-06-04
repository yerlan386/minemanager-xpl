import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white w-full ${widths[size]} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-bold text-navy">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
        <button onClick={onConfirm} className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}
