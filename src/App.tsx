import { useState } from 'react'
import {
  DUMBBELL,
  REST_DAY_SESSION,
  REST_NOTE,
  SESSION_TITLES,
  SHARED_NOTES,
  type Exercise,
  type SessionId,
} from './data/workouts'
import { formatLb, formatLongDate, formatSetsReps, formatShortWeekday, formatWeight } from './format'
import { exportHistory, loadHistory } from './historyStore'
import { HistoryScreen } from './HistoryScreen'
import { dateKey } from './logic/log'
import { getTodayPlan, type NextWorkout } from './logic/plan'
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
        <RestDay key={dateKey(today)} date={today} next={plan.next} />
      ) : (
        <Session date={today} session={plan.letter} exercises={plan.exercises} notes={SHARED_NOTES} />
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

function RestDay({ date, next }: { date: Date; next: NextWorkout }) {
  // Reopen the optional session if sets were already logged today.
  const [started, setStarted] = useState(() => {
    const saved = loadHistory()[dateKey(date)]
    return saved?.letter === REST_DAY_SESSION.id && saved.exercises.some((e) => e.sets.length > 0)
  })

  if (started) {
    return (
      <>
        <p className="kicker">
          Rest day · optional session{' '}
          <button type="button" className="link-button inline" onClick={() => setStarted(false)}>
            Hide
          </button>
        </p>
        <Session
          date={date}
          session={REST_DAY_SESSION.id}
          exercises={REST_DAY_SESSION.exercises}
          notes={REST_DAY_SESSION.notes}
        />
      </>
    )
  }

  return (
    <section className="rest">
      <h1>Rest day</h1>
      <p className="rest-note">{REST_NOTE}</p>
      <p className="next">
        Next workout: <strong>{formatShortWeekday(next.date)} — Workout {next.letter}</strong>
      </p>

      <div className="optional">
        <p className="optional-label">Feel like moving?</p>
        <h2>
          {SESSION_TITLES[REST_DAY_SESSION.id]} <span>· {REST_DAY_SESSION.duration}</span>
        </h2>
        <p>
          {REST_DAY_SESSION.exercises.length} easy exercises for legs and core. They won't affect your
          upper-body recovery.
        </p>
        <button type="button" className="primary-button" onClick={() => setStarted(true)}>
          Start session
        </button>
      </div>
    </section>
  )
}

interface SessionProps {
  date: Date
  session: SessionId
  exercises: Exercise[]
  notes: string[]
}

function Session({ date, session, exercises, notes }: SessionProps) {
  const { day, logSet, undoSet, changeWeight } = useWorkoutLog(date, session, exercises)
  const allDone = exercises.every((ex, i) => day.exercises[i].sets.length >= ex.sets)

  return (
    <section>
      <h1>{SESSION_TITLES[session]}</h1>
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
                {ex.weightLb ? (
                  <WeightStepper
                    name={ex.name}
                    weightLb={log.weightLb}
                    allowBodyweight={ex.weightLb.min === 0}
                    onStep={(direction) => changeWeight(i, direction)}
                  />
                ) : (
                  <span className="weight bodyweight">Bodyweight</span>
                )}
              </div>
              <div className="meta">
                <span className="pips" aria-label={`${done} of ${ex.sets} sets done`}>
                  {Array.from({ length: ex.sets }, (_, s) => (
                    <span
                      key={s}
                      className={s < done ? 'pip on' : 'pip'}
                      title={s < done ? formatLb(log.sets[s].weightLb) : undefined}
                    />
                  ))}
                </span>
                {ex.weightLb && (
                  <span className="start-range">
                    Start {formatWeight(ex)}
                    {ex.weightNote && ` (${ex.weightNote})`}
                  </span>
                )}
              </div>
            </SwipeCard>
          )
        })}
      </ol>

      <details className="notes">
        <summary>Notes</summary>
        <ul>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </details>
    </section>
  )
}

interface WeightStepperProps {
  name: string
  weightLb: number
  allowBodyweight: boolean
  onStep: (direction: 1 | -1) => void
}

function WeightStepper({ name, weightLb, allowBodyweight, onStep }: WeightStepperProps) {
  const floor = allowBodyweight ? 0 : DUMBBELL.minLb
  return (
    <span className="stepper" onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" aria-label={`Decrease ${name} weight`} disabled={weightLb <= floor} onClick={() => onStep(-1)}>
        −
      </button>
      <span className="weight">{formatLb(weightLb, true)}</span>
      <button
        type="button"
        aria-label={`Increase ${name} weight`}
        disabled={weightLb >= DUMBBELL.maxLb}
        onClick={() => onStep(1)}
      >
        +
      </button>
    </span>
  )
}
