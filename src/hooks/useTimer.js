import { useState, useEffect, useRef } from 'react'

function toSeconds(settings) {
  return {
    pomodoro: settings.pomodoro * 60,
    shortBreak: settings.shortBreak * 60,
    longBreak: settings.longBreak * 60,
  }
}

export function useTimer(settings, onSessionEnd) {
  const [sessionType, setSessionType] = useState('pomodoro')
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)

  const intervalRef = useRef(null)
  const sessionEndFiredRef = useRef(false)
  const sessionTypeRef = useRef(sessionType)
  const settingsRef = useRef(settings)
  const isRunningRef = useRef(isRunning)
  const onSessionEndRef = useRef(onSessionEnd)
  const pomodoroCountRef = useRef(pomodoroCount)

  useEffect(() => { sessionTypeRef.current = sessionType }, [sessionType])
  useEffect(() => { settingsRef.current = settings }, [settings])
  useEffect(() => { isRunningRef.current = isRunning }, [isRunning])
  useEffect(() => { onSessionEndRef.current = onSessionEnd }, [onSessionEnd])
  useEffect(() => { pomodoroCountRef.current = pomodoroCount }, [pomodoroCount])

  // Reset current session when its duration changes (only if not running)
  useEffect(() => {
    if (!isRunningRef.current) {
      setTimeLeft(toSeconds(settings)[sessionTypeRef.current])
    }
  }, [settings.pomodoro, settings.shortBreak, settings.longBreak])

  useEffect(() => {
    if (isRunning) {
      sessionEndFiredRef.current = false
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, sessionType])

  useEffect(() => {
    if (timeLeft !== 0 || sessionEndFiredRef.current) return
    sessionEndFiredRef.current = true

    const currentSession = sessionTypeRef.current
    const s = settingsRef.current

    new Audio('/sounds/beep.mp3').play().catch(() => {})
    onSessionEndRef.current?.(currentSession)

    const nextCount = currentSession === 'pomodoro' ? pomodoroCountRef.current + 1 : pomodoroCountRef.current
    const nextSession = currentSession === 'pomodoro'
      ? (nextCount % 4 === 0 ? 'longBreak' : 'shortBreak')
      : 'pomodoro'
    setPomodoroCount(nextCount)
    setSessionType(nextSession)
    setTimeLeft(toSeconds(s)[nextSession])
    if (s.autoStart) setIsRunning(true)
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

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  return { minutes, seconds, isRunning, sessionType, pomodoroCount, setIsRunning, switchSession, reset, resetCycle }
}
