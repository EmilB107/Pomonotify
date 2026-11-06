import { useState, useEffect, useRef } from 'react'

function toSeconds(settings) {
  return {
    pomodoro: settings.pomodoro * 60,
    shortBreak: settings.shortBreak * 60,
    longBreak: settings.longBreak * 60,
    custom: settings.customSeconds,
  }
}

export function useTimer(settings, onSessionEnd) {
  const [sessionType, setSessionType] = useState('pomodoro')
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  const sessionEndFiredRef = useRef(false)
  const sessionTypeRef = useRef(sessionType)
  const settingsRef = useRef(settings)
  const isRunningRef = useRef(isRunning)
  const onSessionEndRef = useRef(onSessionEnd)
  const pomodoroCountRef = useRef(pomodoroCount)
  const timeLeftRef = useRef(timeLeft)

  useEffect(() => { sessionTypeRef.current = sessionType }, [sessionType])
  useEffect(() => { settingsRef.current = settings }, [settings])
  useEffect(() => { isRunningRef.current = isRunning }, [isRunning])
  useEffect(() => { onSessionEndRef.current = onSessionEnd }, [onSessionEnd])
  useEffect(() => { pomodoroCountRef.current = pomodoroCount }, [pomodoroCount])
  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft])

  const duration = toSeconds(settings)[sessionType]

  // Reset current session when its duration changes (only if not running)
  useEffect(() => {
    if (!isRunningRef.current) setTimeLeft(duration)
  }, [duration])

  // Count down against a fixed end time so throttled background tabs don't fall behind.
  useEffect(() => {
    if (!isRunning) return
    sessionEndFiredRef.current = false
    const endAt = Date.now() + timeLeftRef.current * 1000
    let id
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      if (remaining === 0) {
        clearInterval(id)
        document.removeEventListener('visibilitychange', tick)
      }
      setTimeLeft(remaining)
    }
    id = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [isRunning, sessionType])

  useEffect(() => {
    if (timeLeft !== 0 || sessionEndFiredRef.current || !isRunningRef.current) return
    sessionEndFiredRef.current = true

    const currentSession = sessionTypeRef.current
    const s = settingsRef.current

    new Audio('/sounds/beep.mp3').play().catch(() => {})
    onSessionEndRef.current?.(currentSession)

    if (currentSession === 'custom') {
      setIsRunning(false)
      setTimeLeft(s.customSeconds)
      return
    }

    const nextCount = currentSession === 'pomodoro' ? pomodoroCountRef.current + 1 : pomodoroCountRef.current
    const nextSession = currentSession === 'pomodoro'
      ? (nextCount % 4 === 0 ? 'longBreak' : 'shortBreak')
      : 'pomodoro'
    setPomodoroCount(nextCount)
    setSessionType(nextSession)
    setTimeLeft(toSeconds(s)[nextSession])
    setIsRunning(s.autoStart)
  }, [timeLeft])

  function switchSession(type) {
    setSessionType(type)
    setTimeLeft(toSeconds(settings)[type])
    setIsRunning(false)
  }

  function reset() {
    setTimeLeft(toSeconds(settings)[sessionType])
    setIsRunning(false)
  }

  function resetCycle() {
    setPomodoroCount(0)
  }

  const hours = duration >= 3600 ? String(Math.floor(timeLeft / 3600)) : null
  const minutes = String(Math.floor((hours ? timeLeft % 3600 : timeLeft) / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return { hours, minutes, seconds, timeLeft, duration, isRunning, sessionType, pomodoroCount, setIsRunning, switchSession, reset, resetCycle }
}
