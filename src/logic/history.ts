// Pure summaries of the workout history for display.

import type { DayLog, History, SetLog } from './log'

/** A run of consecutive sets with the same reps and weight, e.g. 2 × 10 @ 22.5 lb. */
export interface SetGroup {
  count: number
  reps: number
  weightLb: number
}

/** Days with at least one logged set, newest first, keeping only exercises that were done. */
export function loggedDays(history: History): DayLog[] {
  return Object.values(history)
    .map((day) => ({ ...day, exercises: day.exercises.filter((e) => e.sets.length > 0) }))
    .filter((day) => day.exercises.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function groupSets(sets: SetLog[]): SetGroup[] {
  const groups: SetGroup[] = []
  for (const { reps, weightLb } of sets) {
    const last = groups[groups.length - 1]
    if (last && last.reps === reps && last.weightLb === weightLb) last.count++
    else groups.push({ count: 1, reps, weightLb })
  }
  return groups
}

/** Parses a YYYY-MM-DD key as a local date (noon, so DST never shifts the day). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}
