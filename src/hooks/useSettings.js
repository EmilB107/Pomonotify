import { useState, useEffect } from 'react'

export const DEFAULTS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStart: false,
  notifications: false,
  weatherTheme: false,
  weatherAutoDark: false,
  weatherSource: 'geo',
  weatherCity: '',
  weatherUnit: 'c',
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('pomonotify-settings')
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    localStorage.setItem('pomonotify-settings', JSON.stringify(settings))
  }, [settings])

  function update(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function reset() {
    setSettings(DEFAULTS)
  }

  return { settings, update, reset }
}
