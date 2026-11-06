import { useState } from 'react'
import { Button, SectionLabel } from './Button'
import { Modal } from './Modal'
import { DEFAULTS } from '../hooks/useSettings'

function Segmented({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between py-1 gap-3">
      <span className="text-sm" id={`seg-${label}`}>{label}</span>
      <div role="radiogroup" aria-labelledby={`seg-${label}`} className="flex bg-black/5 dark:bg-white/10 rounded-full p-0.5">
        {options.map(([val, text]) => (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={value === val}
            onClick={() => onChange(val)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              value === val ? 'bg-accent-strong text-white font-semibold' : 'text-[#666] dark:text-[#aaa]'
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

function DurationField({ label, value, onChange, min = 1, max = 99 }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          −
        </button>
        <span className="w-6 text-center text-sm tabular-nums font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? 'bg-accent-strong' : 'bg-black/15 dark:bg-white/15'
        }`}
      >
        <span className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

export function Settings({ settings, update, onClose }) {
  const [draft, setDraft] = useState({ ...settings })

  function set(key, value) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  function handleReset() {
    setDraft({ ...DEFAULTS })
  }

  async function handleNotificationsToggle(value) {
    if (value && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
    }
    set('notifications', value)
  }

  function handleSave() {
    Object.entries(draft).forEach(([key, value]) => update(key, value))
    onClose()
  }

  return (
    <Modal onClose={onClose} className="gap-6">
      <SectionLabel>Settings</SectionLabel>

      <div className="flex flex-col gap-1">
        <p className="text-xs text-[#666] dark:text-[#aaa] mb-1">Duration (minutes)</p>
        <DurationField label="Pomodoro" value={draft.pomodoro} onChange={v => set('pomodoro', v)} />
        <DurationField label="Short Break" value={draft.shortBreak} onChange={v => set('shortBreak', v)} max={60} />
        <DurationField label="Long Break" value={draft.longBreak} onChange={v => set('longBreak', v)} />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs text-[#666] dark:text-[#aaa] mb-1">Behavior</p>
        <Toggle label="Auto-start next session" checked={draft.autoStart} onChange={v => set('autoStart', v)} />
        <Toggle label="Browser notifications" checked={draft.notifications} onChange={handleNotificationsToggle} />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs text-[#666] dark:text-[#aaa] mb-1">Weather</p>
        <Toggle label="Weather-reactive theme" checked={draft.weatherTheme} onChange={v => set('weatherTheme', v)} />
        {draft.weatherTheme && (
          <>
            <Toggle label="Dark mode follows day/night" checked={draft.weatherAutoDark} onChange={v => set('weatherAutoDark', v)} />
            <Segmented
              label="Location"
              value={draft.weatherSource}
              options={[['geo', 'My location'], ['city', 'City']]}
              onChange={v => set('weatherSource', v)}
            />
            {draft.weatherSource === 'city' && (
              <input
                type="text"
                aria-label="City"
                placeholder="e.g. Manila"
                value={draft.weatherCity}
                onChange={e => set('weatherCity', e.target.value)}
                className="mt-1 w-full text-sm bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-2.5 outline-none placeholder:text-[#666] dark:placeholder:text-[#aaa] focus:ring-1 focus:ring-accent-strong dark:focus:ring-accent-soft"
              />
            )}
            <Segmented
              label="Units"
              value={draft.weatherUnit}
              options={[['c', '°C'], ['f', '°F']]}
              onChange={v => set('weatherUnit', v)}
            />
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button size="none" variant="ghost" className="px-4 py-2 text-sm text-red-400 hover:text-red-500" onClick={handleReset}>
          Reset to defaults
        </Button>
        <div className="flex gap-2">
          <Button size="none" variant="ghost" className="px-4 py-2 text-sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="none" variant="primary" className="px-4 py-2 text-sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
