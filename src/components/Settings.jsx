import { useState, useRef } from 'react'
import { Button, SectionLabel } from './Button'
import { Modal } from './Modal'
import { DEFAULTS } from '../hooks/useSettings'
import { SOUND_OPTIONS, playSound, setCustomSound } from '../lib/sounds'
import { validateAudio, saveCustomSound, deleteCustomSound } from '../lib/customSoundStore'

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
  const [soundError, setSoundError] = useState('')
  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function set(key, value) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  function handleReset() {
    setDraft(prev => ({ ...DEFAULTS, customSoundName: prev.customSoundName }))
  }

  const canPreview = draft.sound !== 'none' && (draft.sound !== 'custom' || draft.customSoundName)

  function handleSoundChange(value) {
    set('sound', value)
    setSoundError('')
    if (value !== 'custom' || draft.customSoundName) playSound(value)
  }

  async function handleUpload(file) {
    if (!file) return
    try {
      await validateAudio(file)
      await saveCustomSound(file)
      setCustomSound(file)
      set('customSoundName', file.name)
      setSoundError('')
      playSound('custom')
    } catch (err) {
      setSoundError(err.message || 'Could not save this sound.')
    }
  }

  async function handleRemoveCustom() {
    await deleteCustomSound().catch(() => {})
    setCustomSound(null)
    set('customSoundName', '')
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
        <div className="flex items-center justify-between py-1 gap-3">
          <label htmlFor="sound-select" className="text-sm">Alarm sound</label>
          <div className="flex items-center gap-2">
            <select
              id="sound-select"
              value={draft.sound}
              onChange={e => handleSoundChange(e.target.value)}
              className="text-sm bg-black/5 dark:bg-white/10 dark:[color-scheme:dark] rounded-full px-3 py-1 outline-none focus:ring-1 focus:ring-accent-strong dark:focus:ring-accent-soft"
            >
              {SOUND_OPTIONS.map(([val, text]) => (
                <option key={val} value={val} className="bg-white text-[#1a1a1a] dark:bg-[#1a1a1a] dark:text-white">{text}</option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Preview alarm sound"
              disabled={!canPreview}
              onClick={() => playSound(draft.sound)}
              className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-40"
            >
              ▶
            </button>
          </div>
        </div>
        {draft.sound === 'custom' && (
          <div className="flex flex-col gap-2 pt-1">
            {draft.customSoundName ? (
              <div className="flex items-center gap-3 rounded-2xl border border-accent-strong/40 dark:border-accent-soft/40 bg-accent-strong/5 dark:bg-accent-soft/10 px-4 py-3">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent-strong dark:text-accent-soft">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <span className="flex-1 text-sm font-medium truncate" title={draft.customSoundName}>{draft.customSoundName}</span>
                <Button size="none" variant="ghost" className="px-3 py-1 text-xs text-red-400 hover:text-red-500" onClick={handleRemoveCustom}>
                  Remove
                </Button>
                <Button size="none" variant="primary" className="px-3 py-1 text-xs" onClick={() => fileInputRef.current?.click()}>
                  Replace
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files?.[0]) }}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-5 transition-colors ${
                  dragging
                    ? 'border-accent-strong dark:border-accent-soft bg-accent-strong/10 dark:bg-accent-soft/15'
                    : 'border-accent-strong/50 dark:border-accent-soft/50 hover:bg-accent-strong/5 dark:hover:bg-accent-soft/10'
                }`}
              >
                <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-strong dark:text-accent-soft">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-sm font-semibold">Upload your alarm sound</span>
                <span className="text-xs text-[#666] dark:text-[#aaa]">Click or drag a file here · max 3 MB, 15 seconds</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              aria-label="Upload custom alarm sound"
              onChange={e => { handleUpload(e.target.files?.[0]); e.target.value = '' }}
            />
            {soundError && <p role="alert" className="text-xs text-red-500">{soundError}</p>}
          </div>
        )}
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
