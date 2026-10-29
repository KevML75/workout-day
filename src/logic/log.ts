// Pure workout-log logic: what was done each day. No storage or UI here.

import { DUMBBELL, type Exercise, type WorkoutLetter } from '../data/workouts'

export interface SetLog {
  reps: number
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
  letter: WorkoutLetter
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
export function dayLogFor(history: History, date: string, letter: WorkoutLetter, exercises: Exercise[]): DayLog {
  const saved = history[date]
  return {
    date,
    letter,
    exercises: exercises.map(
      (ex) =>
        saved?.exercises.find((e) => e.name === ex.name) ?? {
          name: ex.name,
          weightLb: lastWeight(history, ex.name, date) ?? ex.weightLb.min,
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

/** Change the selected weight, snapped to the dumbbell's increments and range. */
export function setWeight(day: DayLog, index: number, weightLb: number): DayLog {
  const snapped = Math.round(weightLb / DUMBBELL.stepLb) * DUMBBELL.stepLb
  const clamped = Math.min(DUMBBELL.maxLb, Math.max(DUMBBELL.minLb, snapped))
  return updateExercise(day, index, (e) => ({ ...e, weightLb: clamped }))
}
