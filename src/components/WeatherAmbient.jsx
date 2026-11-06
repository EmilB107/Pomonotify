import { lazy, Suspense, useEffect, useState } from 'react'
import { MOODS } from '../lib/weatherMoods'

// Code-split so users who never enable the weather theme never download tsParticles.
const WeatherParticles = lazy(() => import('./WeatherParticles'))

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const mql = window.matchMedia?.(query)
    if (!mql) return
    const onChange = e => setReduced(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function LightningFlash() {
  const [flashKey, setFlashKey] = useState(0)
  useEffect(() => {
    let id
    const schedule = () => {
      id = setTimeout(() => { setFlashKey(k => k + 1); schedule() }, 6000 + Math.random() * 10000)
    }
    schedule()
    return () => clearTimeout(id)
  }, [])
  if (!flashKey) return null
  return <div key={flashKey} className="absolute inset-0 bg-white animate-lightning" />
}

export function WeatherAmbient({ mood, isDark, wind = 0 }) {
  const reduced = usePrefersReducedMotion()
  const m = MOODS[mood] ?? MOODS.default

  if (mood === 'default') return null

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Static glows: visible even with reduced motion */}
      {mood === 'clear' && (
        <div className="absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-40 dark:opacity-20 motion-safe:animate-sun-pulse"
          style={{ background: `radial-gradient(circle, ${m.soft} 0%, transparent 70%)` }} />
      )}
      {mood === 'night' && (
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${m.soft} 0%, transparent 70%)` }} />
      )}
      {(mood === 'rain' || mood === 'storm') && (
        <div className="absolute inset-0 opacity-60"
          style={{ background: `linear-gradient(to bottom, color-mix(in srgb, ${m.strong} 14%, transparent), transparent 60%)` }} />
      )}

      {!reduced && (
        <Suspense fallback={null}>
          <WeatherParticles mood={mood} color={isDark ? m.soft : m.strong} wind={wind} />
        </Suspense>
      )}

      {!reduced && mood === 'storm' && <LightningFlash />}
    </div>
  )
}
