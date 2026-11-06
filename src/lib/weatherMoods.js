// Each mood defines AA-checked color tokens for light + dark mode.
// strong: buttons/text on light bg (≥4.5:1 vs white), soft: accent text on dark bg.
export const MOODS = {
  default: { label: 'Default', strong: '#52796f', strongHover: '#3f6256', soft: '#84a98c', bgLight: '#f5f5f0', bgDark: '#1a1a1a' },
  clear:   { label: 'Clear',   strong: '#8a5208', strongHover: '#6e4106', soft: '#f0b44a', bgLight: '#fbf6ec', bgDark: '#1c1a16' },
  night:   { label: 'Clear night', strong: '#4a5a9a', strongHover: '#3a4880', soft: '#a3b2f0', bgLight: '#f1f2f8', bgDark: '#12141f' },
  cloudy:  { label: 'Cloudy',  strong: '#4c6075', strongHover: '#3b4c5e', soft: '#a2b5c9', bgLight: '#eff1f3', bgDark: '#191b1e' },
  fog:     { label: 'Fog',     strong: '#5b6363', strongHover: '#474e4e', soft: '#b4bcbc', bgLight: '#f0f0ee', bgDark: '#1b1c1c' },
  rain:    { label: 'Rain',    strong: '#26657f', strongHover: '#1d5066', soft: '#72b6d4', bgLight: '#e9f0f3', bgDark: '#13191d' },
  snow:    { label: 'Snow',    strong: '#3a6694', strongHover: '#2d5277', soft: '#a8ccef', bgLight: '#f3f7fb', bgDark: '#161a20' },
  storm:   { label: 'Thunderstorm', strong: '#6a4e9e', strongHover: '#563f82', soft: '#b8a3f0', bgLight: '#eeecf3', bgDark: '#16141c' },
}

// WMO weather interpretation codes → mood
export function moodFromCode(code, isDay) {
  if (code == null) return 'default'
  if (code <= 1) return isDay ? 'clear' : 'night'
  if (code <= 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'cloudy'
}

export function moodVars(moodKey) {
  const m = MOODS[moodKey] ?? MOODS.default
  return {
    '--accent-strong': m.strong,
    '--accent-strong-hover': m.strongHover,
    '--accent-soft': m.soft,
    '--bg-light': m.bgLight,
    '--bg-dark': m.bgDark,
  }
}
