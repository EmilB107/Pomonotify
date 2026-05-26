import { useRef, useEffect } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'

export function Modal({ onClose, className = '', children }) {
  const ref = useRef(null)
  useFocusTrap(ref, true)

  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="animate-backdrop-in fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        ref={ref}
        className={`animate-modal-in bg-[#f5f5f0] dark:bg-[#242424] text-[#1a1a1a] dark:text-[#e8e8e8] rounded-3xl p-6 w-full max-w-sm flex flex-col ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
