import { useCallback, useEffect, useState } from 'react'
import { moodFromCode } from '../lib/weatherMoods'

const CACHE_KEY = 'pomonotify-weather'
const TTL = 30 * 60 * 1000

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY))
  } catch {
    return null
  }
}

const POSITION_KEY = 'pomonotify-last-position'

const GEO_ERRORS = {
  1: 'Location permission denied',
  2: 'Location unavailable',
  3: 'Location timed out',
}

// Falls back to the last known position when the browser can't get a fix (but not when permission is denied).
function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation unavailable'))
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude }
        try { localStorage.setItem(POSITION_KEY, JSON.stringify(coords)) } catch { /* ignore */ }
        resolve(coords)
      },
      err => {
        let last = null
        try { last = JSON.parse(localStorage.getItem(POSITION_KEY)) } catch { /* ignore */ }
        if (err.code !== 1 && last) resolve(last)
        else reject(new Error(GEO_ERRORS[err.code] ?? 'Location unavailable'))
      },
      { maximumAge: 60 * 60 * 1000, timeout: 10000 },
    )
  })
}

async function geocodeCity(city) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
  if (!res.ok) throw new Error('Geocoding failed')
  const data = await res.json()
  const hit = data.results?.[0]
  if (!hit) throw new Error(`City "${city}" not found`)
  return { lat: hit.latitude, lon: hit.longitude, place: hit.name }
}

const PLACE_CACHE_KEY = 'pomonotify-place'

// Open-Meteo has no reverse geocoding, so the city name comes from BigDataCloud's free client-side endpoint.
// Cached per ~1 km grid cell so it's only looked up again after you move.
async function reverseGeocode(lat, lon) {
  const cell = `${lat.toFixed(2)},${lon.toFixed(2)}`
  try {
    const cached = JSON.parse(localStorage.getItem(PLACE_CACHE_KEY))
    if (cached?.cell === cell) return cached.place
  } catch { /* ignore */ }

  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
    if (!res.ok) throw new Error()
    const d = await res.json()
    const place = d.city || d.locality || d.principalSubdivision
    if (!place) throw new Error()
    try { localStorage.setItem(PLACE_CACHE_KEY, JSON.stringify({ cell, place })) } catch { /* ignore */ }
    return place
  } catch {
    return 'Your location'
  }
}

async function fetchCurrent(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather request failed')
  const { current } = await res.json()
  return {
    temp: current.temperature_2m,
    code: current.weather_code,
    isDay: current.is_day === 1,
    wind: current.wind_speed_10m,
  }
}

export function useWeather({ enabled, source, city }) {
  const sourceKey = source === 'city' ? `city:${city.trim().toLowerCase()}` : 'geo'

  const [state, setState] = useState(() => {
    const cached = readCache()
    return cached?.sourceKey === sourceKey ? { status: 'ready', ...cached } : { status: 'idle' }
  })

  const load = useCallback(async (force = false) => {
    const cached = readCache()
    if (!force && cached?.sourceKey === sourceKey && Date.now() - cached.fetchedAt < TTL) {
      setState({ status: 'ready', ...cached })
      return
    }
    setState(s => ({ ...s, status: s.status === 'ready' ? 'ready' : 'loading', error: null }))
    try {
      let lat, lon, place
      if (source === 'city') {
        if (!city.trim()) throw new Error('Enter a city in Settings')
        ;({ lat, lon, place } = await geocodeCity(city.trim()))
      } else {
        ;({ lat, lon } = await getPosition())
      }
      const [current, resolvedPlace] = await Promise.all([
        fetchCurrent(lat, lon),
        place ?? reverseGeocode(lat, lon),
      ])
      place = resolvedPlace
      const next = { ...current, place, sourceKey, fetchedAt: Date.now() }
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      setState({ status: 'ready', ...next })
    } catch (err) {
      const message = err?.message || 'Weather unavailable'
      setState(s => ({ ...s, status: s.status === 'ready' && s.sourceKey === sourceKey ? 'ready' : 'error', error: message }))
    }
  }, [source, city, sourceKey])

  useEffect(() => {
    if (!enabled) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching external data on enable
    load()
    const id = setInterval(() => load(true), TTL)
    const onOnline = () => load(true)
    window.addEventListener('online', onOnline)
    return () => { clearInterval(id); window.removeEventListener('online', onOnline) }
  }, [enabled, load])

  const ready = enabled && state.status === 'ready' && state.sourceKey === sourceKey
  return {
    status: enabled ? state.status : 'off',
    error: state.error,
    temp: ready ? state.temp : null,
    isDay: ready ? state.isDay : null,
    wind: ready ? state.wind : 0,
    place: ready ? state.place : '',
    mood: ready ? moodFromCode(state.code, state.isDay) : 'default',
    refresh: () => load(true),
  }
}
