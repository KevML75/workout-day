// Workout program data. Kept free of UI code so it can be ported (e.g. to Swift).

export type WorkoutLetter = 'A' | 'B'

export interface Exercise {
  name: string
  /** Muscles worked, primary first. */
  targets: string[]
  sets: number
  reps: number
  /** Extra qualifier shown after reps, e.g. "each arm". */
  repsNote?: string
  /** Starting weight range in lb, per dumbbell. */
  weightLb: { min: number; max: number }
  /** Extra qualifier shown after weight, e.g. "one dumbbell". */
  weightNote?: string
}

/** PowerBlock Elite EXP 90: per-dumbbell range and adjustment step. */
export const DUMBBELL = { minLb: 5, maxLb: 90, stepLb: 2.5 }

/** Monday of program week 1, as a local calendar date (YYYY-MM-DD). */
export const PROGRAM_START_MONDAY = '2026-10-26'

/** Workout days as JS weekday numbers (0 = Sunday). */
export const WORKOUT_WEEKDAYS = [1, 3, 5] as const

/** Letter for each workout day, in odd (week 1, 3, …) and even program weeks. */
export const WEEK_ROTATION: Record<'odd' | 'even', Record<number, WorkoutLetter>> = {
  odd: { 1: 'A', 3: 'B', 5: 'A' },
  even: { 1: 'B', 3: 'A', 5: 'B' },
}

export const WORKOUTS: Record<WorkoutLetter, Exercise[]> = {
  A: [
    { name: 'Overhead press', targets: ['Shoulders', 'Triceps'], sets: 3, reps: 10, weightLb: { min: 15, max: 25 } },
    { name: 'One-arm row', targets: ['Upper back (lats)', 'Biceps'], sets: 3, reps: 10, repsNote: 'each arm', weightLb: { min: 25, max: 35 } },
    { name: 'Lateral raise', targets: ['Side delts'], sets: 3, reps: 12, weightLb: { min: 5, max: 10 } },
    { name: 'Biceps curl', targets: ['Biceps'], sets: 3, reps: 10, weightLb: { min: 15, max: 20 } },
    {
      name: 'Overhead triceps extension',
      targets: ['Triceps'],
      sets: 3,
      reps: 10,
      weightLb: { min: 20, max: 25 },
      weightNote: 'one dumbbell',
    },
  ],
  B: [
    { name: 'Bent-over two-arm row', targets: ['Upper back (lats, rhomboids)', 'Biceps'], sets: 3, reps: 10, weightLb: { min: 20, max: 30 } },
    { name: 'Rear delt fly', targets: ['Rear delts', 'Upper back'], sets: 3, reps: 12, weightLb: { min: 5, max: 10 } },
    { name: 'Dumbbell shrug', targets: ['Traps'], sets: 3, reps: 12, weightLb: { min: 30, max: 40 } },
    { name: 'Hammer curl', targets: ['Biceps', 'Forearms'], sets: 3, reps: 10, weightLb: { min: 15, max: 20 } },
    { name: 'Triceps kickback', targets: ['Triceps'], sets: 3, reps: 12, weightLb: { min: 10, max: 15 } },
  ],
}

export const SHARED_NOTES = [
  'Warm-up 5 min: arm circles, then 1 light set of the first exercise.',
  'Rest 60–90 s between sets.',
  'Last 2 reps should be hard with clean form; adjust by 5 lb if not.',
  'When all 3 sets hit the top reps, move the pin up 5 lb next session.',
  'Make sure the selector pin is fully seated before each set.',
]

export const REST_NOTE = 'Rest day. A walk or light stretching is a good addition.'
