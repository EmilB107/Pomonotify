// Lazy-loaded: tsParticles is only downloaded when the weather theme shows an animated mood.
import { useMemo } from 'react'
import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadBasic } from '@tsparticles/basic'
import { loadLineShape } from '@tsparticles/shape-line'
import { loadRotateUpdater } from '@tsparticles/updater-rotate'

// Must be stable across the app lifecycle (ParticlesProvider requirement).
async function initEngine(engine) {
  await loadBasic(engine)
  await loadLineShape(engine)
  await loadRotateUpdater(engine)
}

const BASE = {
  fullScreen: { enable: false },
  background: { color: 'transparent' },
  fpsLimit: 60,
  detectRetina: true,
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
}

function rainParticles(color, { heavy = false, wind = 0 } = {}) {
  return {
    number: { value: heavy ? 220 : 140, density: { enable: true } },
    shape: { type: 'line', options: { line: { cap: 'round' } } },
    paint: { stroke: { width: heavy ? 1.6 : 1.2, color: { value: color }, opacity: 1 } },
    opacity: { value: { min: 0.25, max: 0.6 } },
    size: { value: { min: 6, max: heavy ? 16 : 12 } },
    rotate: { path: true },
    move: {
      enable: true,
      direction: 'bottom',
      straight: true,
      speed: { min: heavy ? 26 : 18, max: heavy ? 38 : 28 },
      drift: Math.min(wind / 10, 4),
      outModes: { default: 'out' },
    },
  }
}

function particlesFor(mood, color, wind) {
  switch (mood) {
    case 'rain':
      return rainParticles(color, { wind })
    case 'storm':
      return rainParticles(color, { heavy: true, wind: Math.max(wind, 20) })
    case 'snow':
      return {
        number: { value: 130, density: { enable: true } },
        shape: { type: 'circle' },
        paint: { fill: { enable: true, color: { value: color } } },
        opacity: { value: { min: 0.45, max: 0.9 } },
        size: { value: { min: 1.5, max: 4.5 } },
        move: {
          enable: true,
          direction: 'bottom',
          straight: false,
          random: true,
          speed: { min: 0.8, max: 2.4 },
          drift: { min: -1, max: 1 },
          outModes: { default: 'out' },
        },
      }
    case 'cloudy':
    case 'fog':
      return {
        number: { value: mood === 'fog' ? 22 : 14, density: { enable: true } },
        shape: { type: 'circle' },
        paint: { fill: { enable: true, color: { value: color } } },
        opacity: { value: mood === 'fog' ? { min: 0.06, max: 0.14 } : { min: 0.04, max: 0.1 } },
        size: { value: { min: 70, max: 160 } },
        move: { enable: true, direction: 'right', straight: true, speed: { min: 0.15, max: 0.5 }, outModes: { default: 'out' } },
      }
    case 'night':
      return {
        number: { value: 160, density: { enable: true } },
        shape: { type: 'circle' },
        paint: { fill: { enable: true, color: { value: color } } },
        opacity: { value: { min: 0.1, max: 0.9 }, animation: { enable: true, speed: 0.6, sync: false } },
        size: { value: { min: 0.4, max: 1.8 } },
        move: { enable: true, speed: 0.05, random: true, outModes: { default: 'out' } },
      }
    case 'clear':
      return {
        number: { value: 50, density: { enable: true } },
        shape: { type: 'circle' },
        paint: { fill: { enable: true, color: { value: color } } },
        opacity: { value: { min: 0.15, max: 0.6 }, animation: { enable: true, speed: 0.5, sync: false } },
        size: { value: { min: 1, max: 3.5 } },
        move: { enable: true, direction: 'top', random: true, speed: { min: 0.2, max: 0.7 }, outModes: { default: 'out' } },
      }
    default:
      return null
  }
}

export default function WeatherParticles({ mood, color, wind }) {
  // Bucket wind so tiny refresh changes don't restart the canvas.
  const windBucket = Math.round(wind / 5) * 5
  const options = useMemo(() => {
    const particles = particlesFor(mood, color, windBucket)
    return particles ? { ...BASE, particles } : null
  }, [mood, color, windBucket])

  if (!options) return null
  return (
    <ParticlesProvider init={initEngine}>
      <Particles
        id="weather-particles"
        options={options}
        className={`absolute inset-0 animate-backdrop-in ${mood === 'cloudy' || mood === 'fog' ? 'blur-2xl' : ''}`}
      />
    </ParticlesProvider>
  )
}
