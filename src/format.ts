// Display formatting for plan data. UI-side only; the Swift app would do its own.

import type { Exercise } from './data/workouts'

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function formatShortWeekday(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function formatSetsReps(ex: Exercise): string {
  return `${ex.sets} × ${ex.reps}${ex.repsNote ? ` ${ex.repsNote}` : ''}`
}

export function formatWeight(ex: Exercise): string {
  const { min, max } = ex.weightLb
  return min === max ? `${min} lb` : `${min}–${max} lb`
}
