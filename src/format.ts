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

/** Starting weight range, e.g. "15–25 lb" or "bodyweight–15 lb". */
export function formatWeight(ex: Exercise): string {
  if (!ex.weightLb) return 'bodyweight'
  const { min, max } = ex.weightLb
  const low = min === 0 ? 'bodyweight' : `${min}`
  return min === max ? `${low} lb` : `${low}–${max} lb`
}

/** A logged or selected weight; 0 means bodyweight. */
export function formatLb(weightLb: number, short = false): string {
  if (weightLb === 0) return short ? 'BW' : 'bodyweight'
  return `${weightLb} lb`
}
