import { useEffect, useState } from 'react'
import type { Exercise, SessionId } from './data/workouts'
import { dateKey, dayLogFor, logSet, stepWeight, undoSet, type DayLog } from './logic/log'
import { loadHistory, saveHistory } from './historyStore'

/**
 * Today's workout log, saved to the device's history on every change so it survives the
 * app being closed mid-workout. Each new day starts from the weights last used.
 */
export function useWorkoutLog(date: Date, letter: SessionId, exercises: Exercise[]) {
  const key = dateKey(date)
  const [history, setHistory] = useState(loadHistory)
  const [dirty, setDirty] = useState(false)
  const day = dayLogFor(history, key, letter, exercises)

  // Only write once something changed, so just opening the app doesn't log an empty day.
  useEffect(() => {
    if (dirty) saveHistory(history)
  }, [dirty, history])

  const update = (fn: (d: DayLog) => DayLog) => {
    setHistory((h) => ({ ...h, [key]: fn(dayLogFor(h, key, letter, exercises)) }))
    setDirty(true)
  }

  return {
    day,
    logSet: (i: number) => update((d) => logSet(d, i, exercises[i].reps, exercises[i].sets, new Date())),
    undoSet: (i: number) => update((d) => undoSet(d, i)),
    changeWeight: (i: number, direction: 1 | -1) =>
      update((d) => stepWeight(d, i, direction, exercises[i].weightLb?.min === 0)),
  }
}
