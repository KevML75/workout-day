// Pure day-plan logic: no DOM, no React, no clock reads. Written to port cleanly to Swift.

import {
  PROGRAM_START_MONDAY,
  WEEK_ROTATION,
  WORKOUTS,
  WORKOUT_WEEKDAYS,
  type Exercise,
  type WorkoutLetter,
} from '../data/workouts'

export interface NextWorkout {
  /** Local date of the next workout day. */
  date: Date
  letter: WorkoutLetter
}

export type DayPlan =
  | { type: 'rest'; next: NextWorkout }
  | { type: 'workout'; letter: WorkoutLetter; exercises: Exercise[] }

const MS_PER_DAY = 86_400_000

/**
 * Whole days since 1970-01-01 for the *local* calendar date of `date`.
 * Uses Date.UTC on the local Y/M/D so DST shifts and time of day never matter.
 */
function localDayNumber(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY)
}

function parseIsoDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY)
}

/** Modulo that is always non-negative, so dates before the start still alternate. */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

/** Workout letter for `date`, or null on a rest day. */
export function workoutLetterFor(date: Date, startMonday = PROGRAM_START_MONDAY): WorkoutLetter | null {
  const weekday = date.getDay()
  if (!(WORKOUT_WEEKDAYS as readonly number[]).includes(weekday)) return null

  const weekIndex = Math.floor((localDayNumber(date) - parseIsoDay(startMonday)) / 7)
  const parity = mod(weekIndex, 2) === 0 ? 'odd' : 'even'
  return WEEK_ROTATION[parity][weekday]
}

export function getTodayPlan(date: Date, startMonday = PROGRAM_START_MONDAY): DayPlan {
  const letter = workoutLetterFor(date, startMonday)
  if (letter) return { type: 'workout', letter, exercises: WORKOUTS[letter] }

  // Workout days are at most a few days apart, so a week always finds one.
  for (let offset = 1; offset <= 7; offset++) {
    const candidate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset)
    const nextLetter = workoutLetterFor(candidate, startMonday)
    if (nextLetter) return { type: 'rest', next: { date: candidate, letter: nextLetter } }
  }
  throw new Error('No workout day found within a week; check WORKOUT_WEEKDAYS')
}
