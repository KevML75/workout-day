// Persists the workout history on this device and exports it as JSON.

import { dateKey, type History } from './logic/log'

const STORAGE_KEY = 'workout-history:v1'

export function loadHistory(): History {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved && typeof saved === 'object' && saved.version === 1) return saved.days
  } catch {
    // Storage unavailable or corrupt; start fresh.
  }
  return {}
}

export function saveHistory(days: History) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, days }))
  } catch {
    // Private mode etc.; logging still works for this session.
  }
}

/** Opens the share sheet (iOS) to save the history as a JSON file, or downloads it. */
export async function exportHistory() {
  const json = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), days: loadHistory() }, null, 2)
  const name = `workout-history-${dateKey(new Date())}.json`
  const file = new File([json], name, { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (err) {
      if ((err as Error).name === 'AbortError') return // user closed the share sheet
    }
  }

  const url = URL.createObjectURL(file)
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}
