import { useState } from 'react'

const PRESET_GROUPS = [
  { label: 'Seconds', unit: 1, suffix: 's', values: [10, 20, 30, 45, 90] },
  { label: 'Minutes', unit: 60, suffix: 'm', values: [1, 3, 5, 10, 15, 20, 30, 40, 45, 60] },
  { label: 'Hours', unit: 3600, suffix: 'h', values: [1, 2, 4, 8] },
]

const FIELDS = [
  { key: 'h', label: 'Hours', max: 23 },
  { key: 'm', label: 'Minutes', max: 59 },
  { key: 's', label: 'Seconds', max: 59 },
]

function split(total) {
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 }
}

export function CustomTimerPicker({ value, onSelect }) {
  const [fields, setFields] = useState(() => split(value))
  const total = fields.h * 3600 + fields.m * 60 + fields.s

  function setField(key, raw, max) {
    const n = Math.min(max, Math.max(0, parseInt(raw, 10) || 0))
    setFields(f => ({ ...f, [key]: n }))
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#242424] rounded-3xl p-5 flex flex-col gap-4 animate-modal-in">
      {PRESET_GROUPS.map(({ label, unit, suffix, values }) => (
        <div key={label} className="flex flex-col gap-2">
          <span className="text-xs text-[#666] dark:text-[#aaa]">{label}</span>
          <div className="grid grid-cols-5 gap-1.5">
            {values.map(v => {
              const secs = v * unit
              const selected = secs === value
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(secs)}
                  className={`min-h-9 rounded-xl text-sm tabular-nums transition-colors ${
                    selected
                      ? 'bg-accent-strong text-white font-semibold'
                      : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
                  }`}
                >
                  {v}{suffix}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <form
        className="flex items-end gap-2 pt-1 border-t border-black/5 dark:border-white/5"
        onSubmit={e => { e.preventDefault(); if (total > 0) onSelect(total) }}
      >
        {FIELDS.map(({ key, label, max }) => (
          <label key={key} className="flex flex-col gap-1 flex-1 pt-3">
            <span className="text-xs text-[#666] dark:text-[#aaa]">{label}</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max={max}
              value={fields[key]}
              onChange={e => setField(key, e.target.value, max)}
              onFocus={e => e.target.select()}
              className="w-full text-sm tabular-nums bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent-strong dark:focus:ring-accent-soft"
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={total === 0}
          className="min-h-9 px-4 rounded-xl text-sm font-semibold bg-accent-strong hover:bg-accent-strong-hover text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Set
        </button>
      </form>
    </div>
  )
}
