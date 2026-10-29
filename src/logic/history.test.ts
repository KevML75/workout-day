import { describe, expect, it } from 'vitest'
import { groupSets, loggedDays, parseDateKey } from './history'
import type { History } from './log'

const set = (reps: number, weightLb: number) => ({ reps, weightLb, at: '2026-10-26T19:00:00Z' })

describe('loggedDays', () => {
  it('drops empty days and exercises, newest first', () => {
    const history: History = {
      '2026-10-26': {
        date: '2026-10-26',
        letter: 'A',
        exercises: [
          { name: 'Overhead press', weightLb: 20, sets: [set(10, 20)] },
          { name: 'Lateral raise', weightLb: 5, sets: [] },
        ],
      },
      '2026-10-28': { date: '2026-10-28', letter: 'B', exercises: [{ name: 'Rear delt fly', weightLb: 5, sets: [] }] },
      '2026-10-30': { date: '2026-10-30', letter: 'A', exercises: [{ name: 'Biceps curl', weightLb: 15, sets: [set(10, 15)] }] },
    }
    const days = loggedDays(history)
    expect(days.map((d) => d.date)).toEqual(['2026-10-30', '2026-10-26'])
    expect(days[1].exercises.map((e) => e.name)).toEqual(['Overhead press'])
  })
})

describe('groupSets', () => {
  it('merges consecutive identical sets', () => {
    expect(groupSets([set(10, 22.5), set(10, 22.5), set(10, 25)])).toEqual([
      { count: 2, reps: 10, weightLb: 22.5 },
      { count: 1, reps: 10, weightLb: 25 },
    ])
    expect(groupSets([])).toEqual([])
  })
})

describe('parseDateKey', () => {
  it('returns the local calendar date', () => {
    const d = parseDateKey('2026-11-01')
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 10, 1])
  })
})
