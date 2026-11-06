const DB_NAME = 'pomonotify'
const STORE = 'sounds'
const KEY = 'custom'

export const MAX_BYTES = 3 * 1024 * 1024
export const MAX_SECONDS = 15

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run(mode, fn) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = fn(tx.objectStore(STORE))
    tx.oncomplete = () => { db.close(); resolve(req.result) }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export const loadCustomSound = () => run('readonly', store => store.get(KEY))
export const saveCustomSound = blob => run('readwrite', store => store.put(blob, KEY))
export const deleteCustomSound = () => run('readwrite', store => store.delete(KEY))

export function validateAudio(file) {
  if (!file.type.startsWith('audio/')) return Promise.reject(new Error('Please choose an audio file.'))
  if (file.size > MAX_BYTES) return Promise.reject(new Error('File must be 3 MB or smaller.'))

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      if (audio.duration > MAX_SECONDS + 0.5) reject(new Error(`Sound must be ${MAX_SECONDS} seconds or shorter.`))
      else resolve()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Your browser can't play this file format."))
    }
    audio.src = url
  })
}
