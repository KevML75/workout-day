import { describe, expect, it } from 'vitest'
import { REST_DAY_SESSION, WORKOUTS } from '../data/workouts'
import { dateKey, dayLogFor, lastWeight, logSet, stepWeight, undoSet, type History } from './log'

const NOW = new Date('2026-10-28T19:00:00Z')

describe('dateKey', () => {
  it('uses the local date', () => {
    expect(dateKey(new Date(2026, 9, 28, 23, 59))).toBe('2026-10-28')
    expect(dateKey(new Date(2026, 10, 2, 0, 1))).toBe('2026-11-02')
  })
})

describe('dayLogFor', () => {
  it('starts a fresh day at the bottom of each starting range', () => {
    const day = dayLogFor({}, '2026-10-28', 'B', WORKOUTS.B)
    expect(day.exercises.map((e) => e.weightLb)).toEqual([20, 5, 30, 15, 10])
    expect(day.exercises.every((e) => e.sets.length === 0)).toBe(true)
  })

  it('starts at the weight last used, from the most recent earlier day', () => {
    const history: History = {
      '2026-10-21': dayWithSet('2026-10-21', 'Hammer curl', 15),
      '2026-10-23': dayWithSet('2026-10-23', 'Hammer curl', 17.5),
      '2026-10-30': dayWithSet('2026-10-30', 'Hammer curl', 25), // later: ignored
    }
    expect(lastWeight(history, 'Hammer curl', '2026-10-28')).toBe(17.5)
    expect(dayLogFor(history, '2026-10-28', 'B', WORKOUTS.B).exercises[3].weightLb).toBe(17.5)
  })

  it('returns the saved log for the day', () => {
    const saved = logSet(dayLogFor({}, '2026-10-28', 'B', WORKOUTS.B), 0, 10, 3, NOW)
    const day = dayLogFor({ '2026-10-28': saved }, '2026-10-28', 'B', WORKOUTS.B)
    expect(day.exercises[0].sets).toHaveLength(1)
  })
})

describe('logging sets', () => {
  const fresh = () => dayLogFor({}, '2026-10-28', 'B', WORKOUTS.B)

  it('records reps, the selected weight and time, up to the total', () => {
    let day = stepWeight(fresh(), 0, 1, false) // 20 → 22.5
    day = logSet(day, 0, 10, 3, NOW)
    expect(day.exercises[0].sets).toEqual([{ reps: 10, weightLb: 22.5, at: NOW.toISOString() }])
    day = logSet(logSet(day, 0, 10, 3, NOW), 0, 10, 3, NOW)
    expect(logSet(day, 0, 10, 3, NOW)).toBe(day)
  })

  it('undoes the last set, down to zero', () => {
    const day = undoSet(logSet(fresh(), 1, 12, 3, NOW), 1)
    expect(day.exercises[1].sets).toEqual([])
    expect(undoSet(day, 1)).toBe(day)
  })

  it('steps weight by 2.5 lb within 5–90 lb', () => {
    let day = fresh() // first exercise starts at 20
    day = stepWeight(day, 0, 1, false)
    expect(day.exercises[0].weightLb).toBe(22.5)
    for (let i = 0; i < 10; i++) day = stepWeight(day, 0, -1, false)
    expect(day.exercises[0].weightLb).toBe(5)
    for (let i = 0; i < 40; i++) day = stepWeight(day, 0, 1, false)
    expect(day.exercises[0].weightLb).toBe(90)
  })

  it('steps between bodyweight and the lightest dumbbell when allowed', () => {
    let day = dayLogFor({}, '2026-10-29', 'legs', REST_DAY_SESSION.exercises)
    const lunge = 2
    expect(day.exercises[lunge].weightLb).toBe(0)
    expect(stepWeight(day, lunge, -1, true).exercises[lunge].weightLb).toBe(0)
    day = stepWeight(day, lunge, 1, true)
    expect(day.exercises[lunge].weightLb).toBe(5)
    day = stepWeight(day, lunge, 1, true)
    expect(day.exercises[lunge].weightLb).toBe(7.5)
    day = stepWeight(stepWeight(day, lunge, -1, true), lunge, -1, true)
    expect(day.exercises[lunge].weightLb).toBe(0)
  })

  it('starts bodyweight-only moves at 0', () => {
    const day = dayLogFor({}, '2026-10-29', 'legs', REST_DAY_SESSION.exercises)
    expect(day.exercises.map((e) => e.weightLb)).toEqual([25, 20, 0, 0, 0])
  })
})

function dayWithSet(date: string, name: string, weightLb: number) {
  return {
    date,
    letter: 'B' as const,
    exercises: [{ name, weightLb, sets: [{ reps: 10, weightLb, at: `${date}T19:00:00Z` }] }],
  }
}
