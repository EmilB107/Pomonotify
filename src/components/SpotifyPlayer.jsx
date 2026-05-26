import { useState, useEffect, useRef } from 'react'
import { Button, AddButton, TrashButton, SectionLabel } from './Button'
import { ToastContainer } from './Toast'
import { useToast } from '../hooks/useToast'

const DEFAULT_ITEMS = [
  { id: '37i9dQZF1DWUZ5bk6qqDSy', type: 'playlist' },
  { id: '37i9dQZF1DX8Uebhn9wzrS', type: 'playlist' },
  { id: '37i9dQZF1DWZeKCadgRdKQ', type: 'playlist' },
]

function parseSpotifyUrl(url) {
  const match = url.match(/open\.spotify\.com\/(playlist|artist)\/([A-Za-z0-9]+)/)
  if (match) return { type: match[1], id: match[2] }
  return null
}

async function fetchName(type, id) {
  const res = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`)
  const data = await res.json()
  return data.title ?? ''
}

const STORAGE_KEY = 'spotify_items'

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_ITEMS
  } catch {
    return DEFAULT_ITEMS
  }
}

export function SpotifyPlayer() {
  const [items, setItems] = useState(loadItems)
  const [selected, setSelected] = useState(() => loadItems()[0])
  const [showAdd, setShowAdd] = useState(false)
  const [url, setUrl] = useState('')
  const [pendingName, setPendingName] = useState('')
  const [fetching, setFetching] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const { toasts, toast } = useToast()
  const btnRefs = useRef({})

  useEffect(() => {
    btnRefs.current[selected.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [selected.id])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Fetch names for any item missing one
  useEffect(() => {
    items.forEach(item => {
      if (item.name) return
      fetchName(item.type, item.id)
        .then(name => setItems(prev => prev.map(p => p.id === item.id ? { ...p, name } : p)))
        .catch(() => {})
    })
  }, [])

  // Auto-fetch name when URL changes
  useEffect(() => {
    const parsed = parseSpotifyUrl(url.trim())
    if (!parsed) { setPendingName(''); return }
    setFetching(true)
    fetchName(parsed.type, parsed.id)
      .then(setPendingName)
      .catch(() => setPendingName(''))
      .finally(() => setFetching(false))
  }, [url])

  function removeItem(id) {
    const remaining = items.filter(i => i.id !== id)
    setItems(remaining)
    if (selected?.id === id) setSelected(remaining[0] ?? null)
    if (remaining.length === 0) setDeleteMode(false)
  }

  function handleAdd() {
    if (!url.trim()) { toast('Please enter a Spotify URL.'); return }
    const parsed = parseSpotifyUrl(url.trim())
    if (!parsed) { toast('Invalid Spotify URL. Paste a playlist or artist link.'); return }
    if (fetching) return
    if (!pendingName) { toast('Could not fetch playlist info. Try again.'); return }
    if (items.some(i => i.id === parsed.id)) { toast('That playlist is already added.'); return }
    const item = { ...parsed, name: pendingName }
    setItems(prev => [...prev, item])
    setSelected(item)
    setUrl('')
    setPendingName('')
    setShowAdd(false)
  }

  return (
    <>
      <div className="bg-white dark:bg-[#242424] rounded-3xl shadow-md overflow-hidden">

        {/* Header row */}
        <div className="flex items-center gap-2 px-3 py-2 sm:px-5">
          <SectionLabel className="shrink-0">Music</SectionLabel>
          <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-none">
            {items.map(p => (
              deleteMode ? (
                <div key={p.id} className="flex items-center gap-1 shrink-0">
                  <span className="px-2.5 py-1 text-xs bg-black/5 dark:bg-white/10 rounded-2xl whitespace-nowrap font-medium text-[#1a1a1a] dark:text-[#e8e8e8]">
                    {p.name ?? '…'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(p.id)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-red-400/10 hover:bg-red-400/20 text-red-400 text-sm leading-none transition-colors"
                    aria-label={`Remove ${p.name}`}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <Button
                  key={p.id}
                  ref={el => { btnRefs.current[p.id] = el }}
                  variant={selected?.id === p.id ? 'primary' : 'ghost'}
                  size="none"
                  className="shrink-0 px-2.5 py-1 text-xs min-h-8 sm:px-4 sm:py-1.5 sm:text-xs sm:min-h-9"
                  onClick={() => setSelected(p)}
                >
                  {p.name ?? '…'}
                </Button>
              )
            ))}
          </div>
          {deleteMode ? (
            <Button size="none" variant="ghost" className="shrink-0 px-3 py-1.5 text-xs min-h-9" onClick={() => setDeleteMode(false)}>
              Cancel
            </Button>
          ) : (
            <>
              {items.length > 0 && (
                <TrashButton onClick={() => { setDeleteMode(true); setShowAdd(false) }} aria-label="Remove playlists" />
              )}
              <AddButton onClick={() => setShowAdd(v => !v)} aria-label="Add playlist or artist" />
            </>
          )}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="flex gap-2 px-3 pb-3 sm:px-5">
            <input
              autoFocus
              className="flex-1 min-w-0 text-sm bg-transparent border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 outline-none"
              placeholder="Spotify playlist or artist URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Button
              variant="primary"
              size="none"
              className="shrink-0 px-4 py-2 text-sm"
              onClick={handleAdd}
              disabled={fetching || !pendingName}
            >
              {fetching ? '…' : 'Add'}
            </Button>
          </div>
        )}

        {/* Embed */}
        {selected ? (
          <iframe
            key={selected.id}
            src={`https://open.spotify.com/embed/${selected.type}/${selected.id}?theme=0`}
            width="100%"
            height="400"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ) : (
          <p className="text-sm text-center text-[#888] dark:text-[#aaa] py-10">
            No playlists added. Click + to add one.
          </p>
        )}

      </div>
      <ToastContainer toasts={toasts} />
    </>
  )
}
