import { DUMBBELL, REST_NOTE, SHARED_NOTES, type Exercise, type WorkoutLetter } from './data/workouts'
import { formatLongDate, formatSetsReps, formatShortWeekday, formatWeight } from './format'
import { exportHistory } from './historyStore'
import { HistoryScreen } from './HistoryScreen'
import { getTodayPlan } from './logic/plan'
import { SwipeCard } from './SwipeCard'
import { useHashRoute } from './useHashRoute'
import { useToday } from './useToday'
import { useWorkoutLog } from './useWorkoutLog'

export default function App() {
  const today = useToday()
  const plan = getTodayPlan(today)
  const route = useHashRoute()

  if (route === 'history') {
    return (
      <main className="today">
        <nav className="topbar">
          <a href="#">‹ Today</a>
        </nav>
        <HistoryScreen />
        <ExportFooter />
      </main>
    )
  }

  return (
    <main className="today">
      <nav className="topbar">
        <p className="date">{formatLongDate(today)}</p>
        <a href="#history">History</a>
      </nav>

      {plan.type === 'rest' ? (
        <section className="rest">
          <h1>Rest day</h1>
          <p className="rest-note">{REST_NOTE}</p>
          <p className="next">
            Next workout: <strong>{formatShortWeekday(plan.next.date)} — Workout {plan.next.letter}</strong>
          </p>
        </section>
      ) : (
        <Workout date={today} letter={plan.letter} exercises={plan.exercises} />
      )}

      <ExportFooter />
    </main>
  )
}

function ExportFooter() {
  return (
    <footer className="footer">
      <button type="button" className="link-button" onClick={exportHistory}>
        Export history (JSON)
      </button>
    </footer>
  )
}

function Workout({ date, letter, exercises }: { date: Date; letter: WorkoutLetter; exercises: Exercise[] }) {
  const { day, logSet, undoSet, changeWeight } = useWorkoutLog(date, letter, exercises)
  const allDone = exercises.every((ex, i) => day.exercises[i].sets.length >= ex.sets)

  return (
    <section>
      <h1>Workout {letter}</h1>
      <p className="hint">{allDone ? 'All done. Nice work!' : 'Swipe left when you finish a set.'}</p>

      <ol className="exercises">
        {exercises.map((ex, i) => {
          const log = day.exercises[i]
          const done = log.sets.length
          const remaining = ex.sets - done
          return (
            <SwipeCard
              key={ex.name}
              className={remaining === 0 ? 'finished' : undefined}
              canSwipeLeft={remaining > 0}
              canSwipeRight={done > 0}
              onSwipeLeft={() => logSet(i)}
              onSwipeRight={() => undoSet(i)}
            >
              <h2>{ex.name}</h2>
              <p className="targets">{ex.targets.join(' · ')}</p>
              <div className="stats">
                <span className="sets">
                  {remaining === 0 ? '✓ Done' : formatSetsReps({ ...ex, sets: remaining })}
                </span>
                <span className="stepper" onPointerDown={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    aria-label={`Decrease ${ex.name} weight`}
                    disabled={log.weightLb <= DUMBBELL.minLb}
                    onClick={() => changeWeight(i, -DUMBBELL.stepLb)}
                  >
                    −
                  </button>
                  <span className="weight">{log.weightLb} lb</span>
                  <button
                    type="button"
                    aria-label={`Increase ${ex.name} weight`}
                    disabled={log.weightLb >= DUMBBELL.maxLb}
                    onClick={() => changeWeight(i, DUMBBELL.stepLb)}
                  >
                    +
                  </button>
                </span>
              </div>
              <div className="meta">
                <span className="pips" aria-label={`${done} of ${ex.sets} sets done`}>
                  {Array.from({ length: ex.sets }, (_, s) => (
                    <span
                      key={s}
                      className={s < done ? 'pip on' : 'pip'}
                      title={s < done ? `${log.sets[s].weightLb} lb` : undefined}
                    />
                  ))}
                </span>
                <span className="start-range">
                  Start {formatWeight(ex)}
                  {ex.weightNote && ` (${ex.weightNote})`}
                </span>
              </div>
            </SwipeCard>
          )
        })}
      </ol>

      <details className="notes">
        <summary>Notes</summary>
        <ul>
          {SHARED_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </details>
    </section>
  )
}
