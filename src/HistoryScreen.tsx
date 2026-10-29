import { useState } from 'react'
import { SESSION_TITLES } from './data/workouts'
import { formatLb } from './format'
import { loadHistory } from './historyStore'
import { groupSets, loggedDays, parseDateKey } from './logic/history'
import type { SetLog } from './logic/log'

function formatDay(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatSets(sets: SetLog[]): string {
  return groupSets(sets)
    .map((g) => `${g.count} × ${g.reps} ${g.weightLb === 0 ? formatLb(0) : `@ ${formatLb(g.weightLb)}`}`)
    .join(', ')
}

export function HistoryScreen() {
  // Read once on open; Today saves every change, so this is current.
  const [days] = useState(() => loggedDays(loadHistory()))

  return (
    <section className="history">
      <h1>History</h1>
      <p className="hint">
        {days.length === 0
          ? 'Nothing logged yet. Swipe a set on a workout day to start.'
          : `${days.length} workout${days.length === 1 ? '' : 's'} logged`}
      </p>

      <ol className="history-days">
        {days.map((day) => (
          <li key={day.date} className="history-day">
            <h2>
              {formatDay(day.date)} <span className="letter">{SESSION_TITLES[day.letter]}</span>
            </h2>
            <ul>
              {day.exercises.map((ex) => (
                <li key={ex.name}>
                  <span className="ex-name">{ex.name}</span>
                  <span className="ex-sets">{formatSets(ex.sets)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
