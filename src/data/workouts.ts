// Workout program data. Kept free of UI code so it can be ported (e.g. to Swift).

export type WorkoutLetter = 'A' | 'B'

/** A scheduled workout, or the optional rest-day session. */
export type SessionId = WorkoutLetter | 'legs'

export interface Exercise {
  name: string
  /** Muscles worked, primary first. */
  targets: string[]
  sets: number
  reps: number
  /** Extra qualifier shown after reps, e.g. "each arm". */
  repsNote?: string
  /**
   * Starting weight range in lb, per dumbbell. Omitted for bodyweight-only moves;
   * min 0 means start at bodyweight and add dumbbells later.
   */
  weightLb?: { min: number; max: number }
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

export const SESSION_TITLES: Record<SessionId, string> = {
  A: 'Workout A',
  B: 'Workout B',
  legs: 'Legs & core',
}

/** Optional rest-day session: lower body and core, so upper-body recovery isn't affected. */
export const REST_DAY_SESSION = {
  id: 'legs' as const,
  duration: '~20 min',
  exercises: [
    {
      name: 'Goblet squat',
      targets: ['Quads', 'Glutes'],
      sets: 3,
      reps: 10,
      weightLb: { min: 25, max: 35 },
      weightNote: 'one dumbbell',
    },
    { name: 'Romanian deadlift', targets: ['Hamstrings', 'Glutes'], sets: 3, reps: 10, weightLb: { min: 20, max: 30 } },
    {
      name: 'Reverse lunge',
      targets: ['Quads', 'Glutes'],
      sets: 2,
      reps: 8,
      repsNote: 'each leg',
      weightLb: { min: 0, max: 15 },
    },
    { name: 'Glute bridge', targets: ['Glutes'], sets: 2, reps: 15 },
    { name: 'Dead bug', targets: ['Core'], sets: 2, reps: 8, repsNote: 'each side' },
  ] satisfies Exercise[],
  notes: [
    'Warm-up 3 min: march in place, 10 leg swings per leg, 10 bodyweight squats.',
    'Keep it easy: end each set with about 3 reps left in the tank.',
    'Rest about 60 s between sets.',
    'Romanian deadlift: soft knees, push your hips back, keep the dumbbells close to your legs.',
    'Swap dead bug for a 30 s plank if you prefer.',
    'Feeling run down before a workout day? Skip it.',
  ],
}

export const REST_NOTE = 'Rest day. A walk or light stretching is a good addition.'
