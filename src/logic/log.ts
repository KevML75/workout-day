// Pure workout-log logic: what was done each day. No storage or UI here.

import { DUMBBELL, type Exercise, type SessionId } from '../data/workouts'

export interface SetLog {
  reps: number
  /** Per dumbbell; 0 means bodyweight. */
  weightLb: number
  /** ISO timestamp when the set was logged. */
  at: string
}

export interface ExerciseLog {
  name: string
  /** Weight currently selected for the next set. */
  weightLb: number
  sets: SetLog[]
}

export interface DayLog {
  /** Local calendar date, YYYY-MM-DD. */
  date: string
  /** Session done that day (A, B, or the rest-day session); named `letter` for saved-data compatibility. */
  letter: SessionId
  exercises: ExerciseLog[]
}

/** All logged days, keyed by YYYY-MM-DD. */
export type History = Record<string, DayLog>

/** Local calendar date as YYYY-MM-DD. */
export function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Weight used in the most recent logged set of `name` before `beforeDate`, if any. */
export function lastWeight(history: History, name: string, beforeDate: string): number | null {
  const earlier = Object.keys(history)
    .filter((d) => d < beforeDate)
    .sort()
    .reverse()
  for (const d of earlier) {
    const sets = history[d].exercises.find((e) => e.name === name)?.sets
    if (sets?.length) return sets[sets.length - 1].weightLb
  }
  return null
}

/**
 * Today's log for the planned exercises: the saved entry where one exists, otherwise a fresh
 * one that starts at the last weight used (or the bottom of the starting range).
 */
export function dayLogFor(history: History, date: string, letter: SessionId, exercises: Exercise[]): DayLog {
  const saved = history[date]
  return {
    date,
    letter,
    exercises: exercises.map(
      (ex) =>
        saved?.exercises.find((e) => e.name === ex.name) ?? {
          name: ex.name,
          weightLb: lastWeight(history, ex.name, date) ?? ex.weightLb?.min ?? 0,
          sets: [],
        },
    ),
  }
}

function updateExercise(day: DayLog, index: number, fn: (e: ExerciseLog) => ExerciseLog): DayLog {
  return { ...day, exercises: day.exercises.map((e, i) => (i === index ? fn(e) : e)) }
}

/** Log one set at the selected weight; no-op once `totalSets` are done. */
export function logSet(day: DayLog, index: number, reps: number, totalSets: number, now: Date): DayLog {
  if (day.exercises[index].sets.length >= totalSets) return day
  return updateExercise(day, index, (e) => ({
    ...e,
    sets: [...e.sets, { reps, weightLb: e.weightLb, at: now.toISOString() }],
  }))
}

/** Remove the most recent set; no-op when none are logged. */
export function undoSet(day: DayLog, index: number): DayLog {
  if (day.exercises[index].sets.length === 0) return day
  return updateExercise(day, index, (e) => ({ ...e, sets: e.sets.slice(0, -1) }))
}

/**
 * Step the selected weight up or down one dumbbell increment, within the dumbbell's range.
 * With `allowBodyweight`, stepping below the lightest dumbbell goes to bodyweight (0).
 */
export function stepWeight(day: DayLog, index: number, direction: 1 | -1, allowBodyweight: boolean): DayLog {
  const { minLb, maxLb, stepLb } = DUMBBELL
  const current = day.exercises[index].weightLb
  let next = Math.round((current + direction * stepLb) / stepLb) * stepLb
  if (allowBodyweight && next < minLb) next = direction > 0 ? minLb : 0
  next = Math.min(maxLb, Math.max(allowBodyweight ? 0 : minLb, next))
  return updateExercise(day, index, (e) => ({ ...e, weightLb: next }))
}
