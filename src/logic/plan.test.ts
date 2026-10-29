import { describe, expect, it } from 'vitest'
import { getTodayPlan } from './plan'

const START = '2026-10-26'

/** Local date at a given hour (defaults to noon). */
function day(iso: string, hour = 12, minute = 0): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, hour, minute)
}

function summary(date: Date): string {
  const plan = getTodayPlan(date, START)
  return plan.type === 'workout' ? plan.letter : 'rest'
}

describe('getTodayPlan', () => {
  it.each([
    ['2026-10-26', 'A'], // Mon, week 1
    ['2026-10-27', 'rest'],
    ['2026-10-28', 'B'],
    ['2026-10-30', 'A'],
    ['2026-10-31', 'rest'],
    ['2026-11-01', 'rest'],
    ['2026-11-02', 'B'], // Mon, week 2
    ['2026-11-04', 'A'],
    ['2026-11-06', 'B'],
    ['2026-11-09', 'A'], // Mon, week 3
    ['2026-10-19', 'B'], // before the start date
  ])('%s → %s', (iso, expected) => {
    expect(summary(day(iso))).toBe(expected)
  })

  it('returns the five exercises on a workout day', () => {
    const plan = getTodayPlan(day('2026-10-28'), START)
    expect(plan.type).toBe('workout')
    if (plan.type !== 'workout') return
    expect(plan.exercises).toHaveLength(5)
    expect(plan.exercises[0].name).toBe('Bent-over two-arm row')
  })

  it('uses the local date regardless of time of day', () => {
    expect(summary(day('2026-10-27', 23, 59))).toBe('rest')
    expect(summary(day('2026-10-28', 0, 0))).toBe('B')
    expect(summary(day('2026-10-28', 23, 59))).toBe('B')
  })

  it('handles the DST change (Nov 1, 2026 in the US)', () => {
    expect(summary(day('2026-11-02', 0, 30))).toBe('B')
    expect(summary(day('2026-11-09', 0, 30))).toBe('A')
  })

  it.each([
    ['2026-10-27', '2026-10-28', 'B'], // Tue → Wed B
    ['2026-10-31', '2026-11-02', 'B'], // Sat → Mon B
    ['2026-11-01', '2026-11-02', 'B'], // Sun → Mon B
    ['2026-11-05', '2026-11-06', 'B'], // Thu → Fri B
  ])('rest day %s → next workout %s %s', (iso, nextIso, letter) => {
    const plan = getTodayPlan(day(iso), START)
    expect(plan.type).toBe('rest')
    if (plan.type !== 'rest') return
    expect(plan.next.letter).toBe(letter)
    expect(plan.next.date.getTime()).toBe(day(nextIso, 0).getTime())
  })
})
