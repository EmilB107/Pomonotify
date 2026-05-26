import { forwardRef } from 'react'

export const Button = forwardRef(function Button({ variant = 'ghost', size = 'md', className = '', children, ...props }, ref) {
  const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl transition-colors cursor-pointer font-medium leading-none min-h-11'

  const variantClass =
    variant === 'primary'
      ? 'bg-[#84a98c] hover:bg-[#6b9474] text-white font-semibold'
      : 'text-[#888888] dark:text-[#aaaaaa] hover:bg-black/5 dark:hover:bg-white/5'

  const sizeClass =
    size === 'lg'   ? 'px-12 py-4 text-lg min-h-14' :
    size === 'sm'   ? 'px-9 py-3 text-sm min-h-11 min-w-28' :
    size === 'icon' ? 'p-3 min-h-11 min-w-11' :
    size === 'none' ? '' :
                      'px-8 py-3 text-base min-h-11'

  return (
    <button
      ref={ref}
      type="button"
      className={`${base} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

export function AddButton(props) {
  return (
    <Button variant="ghost" size="icon" {...props}>
      <span className="text-xl leading-none">+</span>
    </Button>
  )
}

export function SectionLabel({ children, className = '' }) {
  return (
    <span className={`text-xs font-semibold tracking-widest text-[#888] dark:text-[#aaa] uppercase ${className}`}>
      {children}
    </span>
  )
}

export function TrashButton(props) {
  return (
    <Button variant="ghost" size="icon" {...props}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </Button>
  )
}
