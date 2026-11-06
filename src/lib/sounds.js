import { loadCustomSound } from './customSoundStore'

export const SOUND_OPTIONS = [
  ['beep', 'Beep'],
  ['chime', 'Chime'],
  ['bell', 'Bell'],
  ['digital', 'Digital'],
  ['soft', 'Soft'],
  ['custom', 'Custom…'],
  ['none', 'None'],
]

let ctx
function getCtx() {
  if (!ctx) {
    if (!window.AudioContext) return null
    ctx = new AudioContext()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone(ac, { freq, start = 0, duration = 0.4, type = 'sine', gain = 0.3 }) {
  const t0 = ac.currentTime + start
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

const SYNTHS = {
  beep(ac) {
    for (let i = 0; i < 3; i++) {
      tone(ac, { freq: 880, start: i * 0.3, duration: 0.18, gain: 0.3 })
    }
  },
  chime(ac) {
    ;[1046.5, 1318.5, 1568].forEach((freq, i) => tone(ac, { freq, start: i * 0.18, duration: 0.9, gain: 0.25 }))
  },
  bell(ac) {
    ;[0, 0.9].forEach(start => {
      tone(ac, { freq: 880, start, duration: 1.6, gain: 0.3 })
      tone(ac, { freq: 880 * 2.76, start, duration: 0.9, gain: 0.08 })
      tone(ac, { freq: 880 * 5.4, start, duration: 0.5, gain: 0.04 })
    })
  },
  digital(ac) {
    for (let burst = 0; burst < 2; burst++) {
      for (let i = 0; i < 4; i++) {
        tone(ac, { freq: 2000, start: burst * 0.7 + i * 0.1, duration: 0.06, type: 'square', gain: 0.08 })
      }
    }
  },
  soft(ac) {
    tone(ac, { freq: 659.25, duration: 1.2, type: 'triangle', gain: 0.25 })
    tone(ac, { freq: 523.25, start: 0.35, duration: 1.4, type: 'triangle', gain: 0.25 })
  },
}

let customUrl = null

export function setCustomSound(blob) {
  if (customUrl) URL.revokeObjectURL(customUrl)
  customUrl = blob ? URL.createObjectURL(blob) : null
}

async function playCustom() {
  if (!customUrl) setCustomSound(await loadCustomSound().catch(() => null))
  if (!customUrl) return playSound('beep')
  new Audio(customUrl).play().catch(() => playSound('beep'))
}

export function playSound(name = 'beep') {
  if (name === 'custom') return void playCustom()
  const synth = SYNTHS[name]
  const ac = synth && getCtx()
  if (ac) synth(ac)
}
