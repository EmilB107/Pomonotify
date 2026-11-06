import { MOODS } from '../lib/weatherMoods'

const ICONS = {
  clear: <><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  night: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  cloudy: <path d="M17.5 19H8a5 5 0 1 1 1.2-9.86A6 6 0 0 1 20.5 12 3.5 3.5 0 0 1 17.5 19z" />,
  fog: <path d="M4 10h16M3 14h18M6 18h12M7 6h10" />,
  rain: <><path d="M17.5 15H8a5 5 0 1 1 1.2-9.86A6 6 0 0 1 20.5 8 3.5 3.5 0 0 1 17.5 15z" /><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" /></>,
  snow: <><path d="M17.5 15H8a5 5 0 1 1 1.2-9.86A6 6 0 0 1 20.5 8 3.5 3.5 0 0 1 17.5 15z" /><path d="M8 19h.01M12 21h.01M16 19h.01" /></>,
  storm: <><path d="M17.5 14H8a5 5 0 1 1 1.2-9.86A6 6 0 0 1 20.5 7 3.5 3.5 0 0 1 17.5 14z" /><path d="M13 14l-3 4h4l-3 4" /></>,
}

export function WeatherChip({ weather, unit, onClick }) {
  const { status, mood, temp, place, error } = weather
  if (status === 'off') return null

  const degrees = temp == null ? null : Math.round(unit === 'f' ? temp * 9 / 5 + 32 : temp)

  let content
  if (degrees != null) {
    content = (
      <>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {ICONS[mood] ?? ICONS.cloudy}
        </svg>
        <span className="tabular-nums">{degrees}°{unit === 'f' ? 'F' : 'C'}</span>
        {place && <span className="hidden sm:inline text-[#666] dark:text-[#aaa] font-normal">· {place}</span>}
      </>
    )
  } else if (status === 'error') {
    content = <span className="text-[#666] dark:text-[#aaa] font-normal">Weather off · {error}</span>
  } else {
    content = <span className="text-[#666] dark:text-[#aaa] font-normal">Loading weather…</span>
  }

  const label = degrees != null ? `Weather: ${MOODS[mood]?.label ?? ''}, ${degrees} degrees${place ? ` in ${place}` : ''}. Refresh` : 'Weather status. Refresh'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title="Refresh weather"
      className="mr-auto inline-flex items-center gap-1.5 min-h-11 px-3 rounded-2xl text-sm font-medium text-accent-strong dark:text-accent-soft hover:bg-black/5 dark:hover:bg-white/5 transition-colors max-w-[60vw] truncate"
    >
      {content}
    </button>
  )
}
