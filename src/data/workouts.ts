// Workout program data. Kept free of UI code so it can be ported (e.g. to Swift).

export type WorkoutLetter = 'A' | 'B' | 'C'

/**
 * A scheduled workout, or an optional rest-day session. 'legs' was the rest-day session
 * before legs moved into A/B/C; kept so older history entries still get a title.
 */
export type SessionId = WorkoutLetter | 'core' | 'legs'

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

/**
 * Workout for each workout day (JS weekday → letter), one entry per program week, repeating.
 * A single week means the same plan every week. For the old alternating schedule use:
 * [{ 1: 'A', 3: 'B', 5: 'A' }, { 1: 'B', 3: 'A', 5: 'B' }]
 */
export const WEEK_ROTATION: Record<number, WorkoutLetter>[] = [{ 1: 'A', 3: 'B', 5: 'C' }]

// Full-body days: each has a push, a pull and a leg exercise, plus two smaller ones.
export const WORKOUTS: Record<WorkoutLetter, Exercise[]> = {
  A: [
    { name: 'Overhead press', targets: ['Shoulders', 'Triceps'], sets: 3, reps: 10, weightLb: { min: 15, max: 25 } },
    { name: 'One-arm row', targets: ['Upper back (lats)', 'Biceps'], sets: 3, reps: 10, repsNote: 'each arm', weightLb: { min: 25, max: 35 } },
    {
      name: 'Goblet squat',
      targets: ['Quads', 'Glutes'],
      sets: 3,
      reps: 10,
      weightLb: { min: 25, max: 35 },
      weightNote: 'one dumbbell',
    },
    { name: 'Lateral raise', targets: ['Side delts'], sets: 3, reps: 12, weightLb: { min: 5, max: 10 } },
    { name: 'Biceps curl', targets: ['Biceps'], sets: 3, reps: 10, weightLb: { min: 15, max: 20 } },
  ],
  B: [
    { name: 'Romanian deadlift', targets: ['Hamstrings', 'Glutes', 'Lower back'], sets: 3, reps: 10, weightLb: { min: 20, max: 30 } },
    { name: 'Push-up', targets: ['Chest', 'Shoulders', 'Triceps'], sets: 3, reps: 10 },
    { name: 'Bent-over two-arm row', targets: ['Upper back (lats, rhomboids)', 'Biceps'], sets: 3, reps: 10, weightLb: { min: 20, max: 30 } },
    { name: 'Rear delt fly', targets: ['Rear delts', 'Upper back'], sets: 3, reps: 12, weightLb: { min: 5, max: 10 } },
    {
      name: 'Overhead triceps extension',
      targets: ['Triceps'],
      sets: 3,
      reps: 10,
      weightLb: { min: 20, max: 25 },
      weightNote: 'one dumbbell',
    },
  ],
  C: [
    { name: 'Dumbbell floor press', targets: ['Chest', 'Triceps'], sets: 3, reps: 10, weightLb: { min: 20, max: 30 } },
    {
      name: 'Reverse lunge',
      targets: ['Quads', 'Glutes'],
      sets: 3,
      reps: 8,
      repsNote: 'each leg',
      weightLb: { min: 0, max: 15 },
    },
    { name: 'Floor fly', targets: ['Chest'], sets: 3, reps: 12, weightLb: { min: 10, max: 15 } },
    {
      name: 'Dumbbell pullover',
      targets: ['Lats', 'Chest'],
      sets: 3,
      reps: 12,
      weightLb: { min: 15, max: 25 },
      weightNote: 'one dumbbell',
    },
    { name: 'Hammer curl', targets: ['Biceps', 'Forearms'], sets: 3, reps: 10, weightLb: { min: 15, max: 20 } },
  ],
}

/** Extra notes for a specific workout, shown after the shared notes. */
export const WORKOUT_NOTES: Partial<Record<WorkoutLetter, string[]>> = {}

export const SHARED_NOTES = [
  'Warm up 5 min with arm circles, plus 1 light set of the first exercise.',
  'Rest 60–90 s. Last 2 reps should be hard but clean.',
  'All 3 sets felt easy? Add 5 lb next time.',
]

export const SESSION_TITLES: Record<SessionId, string> = {
  A: 'Workout A',
  B: 'Workout B',
  C: 'Workout C',
  core: 'Core & mobility',
  legs: 'Legs & core',
}

/** Optional rest-day session: easy core and mobility work, so recovery isn't affected. */
export const REST_DAY_SESSION = {
  id: 'core' as const,
  duration: '~15 min',
  blurb: 'Easy core work and stretches. Nothing that gets in the way of recovery.',
  exercises: [
    { name: 'Dead bug', targets: ['Core'], sets: 2, reps: 8, repsNote: 'each side' },
    { name: 'Bird dog', targets: ['Core', 'Lower back'], sets: 2, reps: 8, repsNote: 'each side' },
    { name: 'Glute bridge', targets: ['Glutes', 'Lower back'], sets: 2, reps: 15 },
    { name: 'Cat-cow', targets: ['Spine mobility'], sets: 1, reps: 10 },
    { name: "World's greatest stretch", targets: ['Hips', 'Upper back mobility'], sets: 1, reps: 5, repsNote: 'each side' },
  ] satisfies Exercise[],
  notes: ['Move slowly and breathe out on the effort. This should feel easy.'],
}

export const REST_NOTE = 'Rest day. A walk or light stretching is a good addition.'
