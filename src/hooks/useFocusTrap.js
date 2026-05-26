import { useEffect } from 'react'

const FOCUSABLE = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return
    const container = ref.current
    const getFocusable = () => [...container.querySelectorAll(FOCUSABLE)]
    getFocusable()[0]?.focus()

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (!items.length) { e.preventDefault(); return }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => container.removeEventListener('keydown', onKeyDown)
  }, [active, ref])
}
