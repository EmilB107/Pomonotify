# Pomonotify

A minimal Pomodoro timer with task management and Spotify integration.

## Features

- **Pomodoro timer** — 25/5/15 minute sessions with a circular progress ring; reset the 4-session cycle at any time
- **Auto-advance** — automatically moves Pomodoro → Short Break → Long Break (every 4th cycle) → Pomodoro
- **Sound & notifications** — audio alarm and browser notifications on session end
- **Task list** — add, complete, reorder (drag), delete, and clear completed tasks; mark one as the active focus
- **Spotify player** — embed any Spotify playlist or artist, add/remove entries, persisted across sessions
- **Settings** — customize session durations, auto-start, and notifications
- **Keyboard shortcuts** — control everything without touching the mouse
- **Dark / light theme** — persisted across sessions
- **Accessible** — WCAG AA compliant, keyboard navigable, focus-trapped modals, screen reader announcements on session change
- **Installable (PWA)** — add to home screen on mobile or install from desktop browser; works offline via service worker
- **Responsive** — works on mobile and desktop

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start / Pause |
| `1` | Switch to Pomodoro |
| `2` | Switch to Short Break |
| `3` | Switch to Long Break |
| `T` | Add new task |
| `S` | Open / Close Settings |

## Tech Stack

- [React 19](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [@dnd-kit](https://dndkit.com) — drag-to-reorder tasks (touch-friendly)
- Spotify oEmbed API — fetch playlist names without auth
- Web Audio API — session end alarm
- `localStorage` — persist todos, settings, Spotify items, and theme
- Service Worker — offline support via stale-while-revalidate caching

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
