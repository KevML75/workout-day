import { useEffect, useState } from 'react'

function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Dev only: `?date=2026-10-27` previews another day. */
function devDateOverride(): Date | null {
  if (!import.meta.env.DEV) return null
  const match = new URLSearchParams(location.search).get('date')?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? new Date(+match[1], +match[2] - 1, +match[3], 12) : null
}

/**
 * The current local date, updated when the day rolls over. A home-screen app can sit
 * suspended for days, so also re-check whenever it comes back to the foreground.
 */
export function useToday(): Date {
  const [today, setToday] = useState(() => devDateOverride() ?? new Date())

  useEffect(() => {
    if (devDateOverride()) return
    const refresh = () => setToday((prev) => (sameLocalDay(prev, new Date()) ? prev : new Date()))
    const timer = setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return today
}
