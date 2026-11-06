import { useEffect, useRef, useState } from 'react'
import { useTimer } from './hooks/useTimer'
import { useTodos } from './hooks/useTodos'
import { useSettings } from './hooks/useSettings'
import { Button, SectionLabel } from './components/Button'
import { Modal } from './components/Modal'
import { TodoList } from './components/TodoList'
import { SpotifyPlayer } from './components/SpotifyPlayer'
import { Settings } from './components/Settings'
import { CustomTimerPicker } from './components/CustomTimerPicker'
import { WeatherAmbient } from './components/WeatherAmbient'
import { WeatherChip } from './components/WeatherChip'
import { useWeather } from './hooks/useWeather'
import { moodVars, MOODS } from './lib/weatherMoods'

function SunIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function KeyboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
    </svg>
  )
}

const SHORTCUTS = [
  { key: 'Space', action: 'Start / Pause' },
  { key: '1', action: 'Switch to Pomodoro' },
  { key: '2', action: 'Switch to Short Break' },
  { key: '3', action: 'Switch to Long Break' },
  { key: '4', action: 'Custom timer' },
  { key: 'T', action: 'Add new task' },
  { key: 'S', action: 'Open / Close Settings' },
]

function ShortcutsModal({ onClose }) {
  return (
    <Modal onClose={onClose} className="gap-4">
      <SectionLabel>Keyboard Shortcuts</SectionLabel>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left pb-2 font-medium text-[#666] dark:text-[#aaa]">Key</th>
            <th className="text-left pb-2 font-medium text-[#666] dark:text-[#aaa]">Action</th>
          </tr>
        </thead>
        <tbody>
          {SHORTCUTS.map(({ key, action }) => (
            <tr key={key} className="border-t border-black/5 dark:border-white/5">
              <td className="py-2.5 pr-4">
                <kbd className="px-2 py-1 text-xs text-[#1a1a1a] dark:text-[#e8e8e8] bg-black/8 dark:bg-white/10 rounded-lg font-mono">{key}</kbd>
              </td>
              <td className="py-2.5 text-[#1a1a1a] dark:text-[#e8e8e8]">{action}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button size="none" variant="primary" className="px-4 py-2 text-sm self-end" onClick={onClose}>
        Got it
      </Button>
    </Modal>
  )
}

const RING_R = 90
const RING_C = 2 * Math.PI * RING_R

const SESSION_LABELS = {
  pomodoro: 'Pomodoro',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  custom: 'Custom',
}

const NOTIFICATION_MESSAGES = {
  pomodoro: { title: 'Pomodoro complete!', body: 'Time for a break.' },
  shortBreak: { title: 'Break over!', body: 'Ready to focus?' },
  longBreak: { title: 'Long break over!', body: 'Ready to focus again?' },
  custom: { title: 'Timer done!', body: 'Your custom timer has finished.' },
}

function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light')
  const [showSettings, setShowSettings] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  const { settings, update, reset: resetSettings } = useSettings()

  const weather = useWeather({
    enabled: settings.weatherTheme,
    source: settings.weatherSource,
    city: settings.weatherCity,
  })
  const followDayNight = settings.weatherTheme && settings.weatherAutoDark && weather.isDay != null
  const effectiveDark = followDayNight ? !weather.isDay : isDark

  useEffect(() => {
    const m = MOODS[weather.mood] ?? MOODS.default
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', effectiveDark ? m.bgDark : m.bgLight)
    document.body.style.backgroundColor = effectiveDark ? m.bgDark : m.bgLight
  }, [weather.mood, effectiveDark])

  function handleSessionEnd(type) {
    if (settings.notifications && Notification.permission === 'granted') {
      const { title, body } = NOTIFICATION_MESSAGES[type]
      new Notification(title, { body })
    }
  }

  const {
    hours,
    minutes,
    seconds,
    timeLeft,
    duration,
    isRunning,
    sessionType,
    pomodoroCount,
    setIsRunning,
    switchSession,
    reset,
    resetCycle,
  } = useTimer(settings, handleSessionEnd)

  function handleSessionClick(type) {
    if (type === 'custom' && sessionType === 'custom') {
      setShowCustomPicker(v => !v)
      return
    }
    switchSession(type)
    setShowCustomPicker(type === 'custom')
  }

  function handleCustomSelect(secs) {
    update('customSeconds', secs)
    setIsRunning(false)
    if (sessionType !== 'custom') switchSession('custom')
    setShowCustomPicker(false)
  }

  const { todos, activeTask, setActiveTask, addTodo, toggleTodo, deleteTodo, reorderTodos, clearCompleted } = useTodos()
  const activeTaskText = todos.find(t => t.id === activeTask)?.text

  useEffect(() => {
    document.title = `${SESSION_LABELS[sessionType]} · ${hours ? `${hours}:` : ''}${minutes}:${seconds} | Pomonotify`
  }, [hours, minutes, seconds, sessionType])

  const [announcement, setAnnouncement] = useState('')
  const isFirstSession = useRef(true)
  useEffect(() => {
    if (isFirstSession.current) { isFirstSession.current = false; return }
    setAnnouncement(`${SESSION_LABELS[sessionType]} started`)
  }, [sessionType])

  useEffect(() => {
    function handleKeyDown(e) {
      if (showShortcuts) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') { setShowCustomPicker(false); return }
      if (showSettings) {
        if (e.key === 's' || e.key === 'S') setShowSettings(false)
        return
      }

      if (e.key === ' ') { e.preventDefault(); if (duration > 0) setIsRunning(r => !r) }
      else if (e.key === '1') handleSessionClick('pomodoro')
      else if (e.key === '2') handleSessionClick('shortBreak')
      else if (e.key === '3') handleSessionClick('longBreak')
      else if (e.key === '4') handleSessionClick('custom')
      else if (e.key === 't' || e.key === 'T') { e.preventDefault(); setShowAddTask(true) }
      else if (e.key === 's' || e.key === 'S') setShowSettings(v => !v)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className={`mood-root ${effectiveDark ? 'dark' : ''}`} style={moodVars(weather.mood)}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>

      {/* Full-screen background */}
      <div className="min-h-screen bg-mood-bg-light dark:bg-mood-bg-dark text-[#1a1a1a] dark:text-[#e8e8e8] transition-colors duration-300 flex flex-col justify-center items-center">

        <WeatherAmbient mood={weather.mood} isDark={effectiveDark} wind={weather.wind} />

        {/* Centered container */}
        <main className="relative z-10 w-full max-w-3xl px-4 sm:px-6">

          {/* Timer section */}
          <section className="flex flex-col items-center gap-6 py-12 sm:py-16">

            {/* Utility icons */}
            <div className="flex items-center gap-1 self-stretch justify-end">
              <WeatherChip weather={weather} unit={settings.weatherUnit} onClick={weather.refresh} />
              <Button size="icon" onClick={() => setShowShortcuts(true)} aria-label="Keyboard shortcuts">
                <KeyboardIcon />
              </Button>
              <Button
                size="icon"
                onClick={() => {
                  if (followDayNight) update('weatherAutoDark', false)
                  const next = !effectiveDark
                  localStorage.setItem('theme', next ? 'dark' : 'light')
                  setIsDark(next)
                }}
                aria-label="Toggle theme"
                title={followDayNight ? 'Following day/night — click to override' : 'Toggle theme'}
              >
                {effectiveDark ? <SunIcon /> : <MoonIcon />}
              </Button>
            </div>

            {/* Session switcher */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {Object.entries(SESSION_LABELS).map(([type, label]) => (
                <Button
                  key={type}
                  variant={sessionType === type ? 'primary' : 'ghost'}
                  size="none"
                  className="px-3 py-1.5 text-xs min-h-9 sm:px-9 sm:py-3 sm:text-sm sm:min-h-11"
                  onClick={() => handleSessionClick(type)}
                  aria-expanded={type === 'custom' ? showCustomPicker : undefined}
                >
                  {label}
                </Button>
              ))}
            </div>

            {showCustomPicker && (
              <CustomTimerPicker value={settings.customSeconds} onSelect={handleCustomSelect} />
            )}

            {/* Timer with progress ring */}
            <div className="relative w-56 h-56 sm:w-80 sm:h-80 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={RING_R} fill="none" stroke="currentColor" strokeWidth="3" className="text-black/10 dark:text-white/10" />
                <circle
                  key={`${sessionType}-${pomodoroCount}`}
                  cx="100" cy="100" r={RING_R}
                  fill="none"
                  stroke="currentColor"
                  className="text-accent-soft"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={duration > 0 ? RING_C * (1 - timeLeft / duration) : RING_C}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="text-[3rem] sm:text-[4.5rem] leading-none font-light tabular-nums tracking-tight select-none">
                {hours && <span>{hours}:</span>}
                <span key={minutes} className="animate-digit-in inline-block">{minutes}</span>
                <span>:</span>
                <span>{seconds}</span>
              </span>
            </div>

            {/* Session counter — hidden during breaks */}
            {sessionType === 'pomodoro' && (
              <div className="flex items-center gap-2">
                <p className="text-base text-[#666] dark:text-[#aaa]">
                  Pomodoro {(pomodoroCount % 4) + 1}/4
                </p>
                {pomodoroCount > 0 && (
                  <button
                    type="button"
                    onClick={resetCycle}
                    aria-label="Reset cycle"
                    title="Reset cycle"
                    className="text-[#666] dark:text-[#aaa] hover:text-accent-strong dark:hover:text-accent-soft transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button variant="primary" size="md" onClick={() => setIsRunning(r => !r)} disabled={duration === 0} className="disabled:opacity-40 disabled:cursor-not-allowed">
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button variant="ghost" size="md" onClick={reset}>
                Reset
              </Button>
              <Button size="icon" aria-label="Settings" onClick={() => setShowSettings(true)}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Button>
            </div>

            {/* Active task */}
            {activeTaskText && (
              <p className="text-base text-[#666] dark:text-[#aaa]">
                Working on: <span className="text-accent-strong dark:text-accent-soft font-medium">{activeTaskText}</span>
              </p>
            )}

          </section>

          {/* Bottom section */}
          <section className="flex flex-col gap-6 pb-12">
            <TodoList
              todos={todos}
              activeTask={activeTask}
              setActiveTask={setActiveTask}
              addTodo={addTodo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              reorderTodos={reorderTodos}
              clearCompleted={clearCompleted}
              showAdd={showAddTask}
              setShowAdd={setShowAddTask}
            />
            <SpotifyPlayer />
          </section>

        </main>
      </div>

      {showSettings && (
        <Settings settings={settings} update={update} reset={resetSettings} onClose={() => setShowSettings(false)} />
      )}
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

    </div>
  )
}

export default App
