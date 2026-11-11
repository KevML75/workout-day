# Workout Day App — Build Spec

## Goal
A tiny web app that, when opened, tells me what to do **today**:
- **Rest day** → a simple "Rest day" screen, nothing else.
- **Workout day** → the name of the workout (A, B or C) and its five exercises, each with sets, reps and starting weight.

Must work well on an iPhone (I'll mostly open it on my phone). A native iOS app may come later, so keep the workout data and day logic separate from the UI so they can be reused.

## Equipment context
PowerBlock Elite EXP 90 adjustable dumbbells (5–90 lb per dumbbell, 2.5 lb increments with the adder weights). No bench assumed; a chair works for one-arm rows.

## Schedule rules
- Workout days: **Monday, Wednesday, Friday**. All other days are rest days.
- Same plan every week: **Mon = A, Wed = B, Fri = C**.
- The schedule is a list of weeks that repeats (`WEEK_ROTATION`), so a multi-week rotation is still possible. Program week 1 starts on a configurable Monday: `PROGRAM_START_MONDAY = "2026-10-26"`.
  - `weekIndex = floor((today − PROGRAM_START_MONDAY) in days / 7)`; the week used is `WEEK_ROTATION[weekIndex mod length]`. Use a proper modulo so dates before the start date don't break.
  - (Before 2026-11-04 the schedule alternated A/B: odd weeks Mon A, Wed B, Fri A; even weeks Mon B, Wed A, Fri B.)
- Use the **device's local date** (not UTC). I'm in America/Los_Angeles, so a late-evening open must not jump to the next day.

## Workout data
Store this as a single data file (e.g. `workouts.json` or a typed `workouts.ts`), not hard-coded in components.

Each workout is full-body: one push, one pull and one leg exercise, plus two smaller ones (rebalanced 2026-11-09 so legs are trained 3×/week and chest 2×/week). Order: big and technical lifts first, isolation last; on B the deadlift goes first so the lower back is fresh, and push-ups separate it from the bent-over row.

### Workout A (Mon)
| # | Exercise | Sets × Reps | Starting weight |
|---|----------|-------------|-----------------|
| 1 | Overhead press | 3 × 10 | 15–25 lb |
| 2 | One-arm row | 3 × 10 each arm | 25–35 lb |
| 3 | Goblet squat | 3 × 10 | 25–35 lb (one dumbbell) |
| 4 | Lateral raise | 3 × 12 | 5–10 lb |
| 5 | Biceps curl | 3 × 10 | 15–20 lb |

### Workout B (Wed)
| # | Exercise | Sets × Reps | Starting weight |
|---|----------|-------------|-----------------|
| 1 | Romanian deadlift | 3 × 10 | 20–30 lb |
| 2 | Push-up | 3 × 10 | bodyweight |
| 3 | Bent-over two-arm row | 3 × 10 | 20–30 lb |
| 4 | Rear delt fly | 3 × 12 | 5–10 lb |
| 5 | Overhead triceps extension | 3 × 10 | 20–25 lb (one dumbbell) |

### Workout C (Fri; floor-based since there's no bench)
| # | Exercise | Sets × Reps | Starting weight |
|---|----------|-------------|-----------------|
| 1 | Dumbbell floor press | 3 × 10 | 20–30 lb |
| 2 | Reverse lunge | 3 × 8 each leg | bodyweight–15 lb |
| 3 | Floor fly | 3 × 12 | 10–15 lb |
| 4 | Dumbbell pullover | 3 × 12 | 15–25 lb (one dumbbell) |
| 5 | Hammer curl | 3 × 10 | 15–20 lb |

### Optional rest-day session: Core & mobility (~15 min)
Dead bug 2 × 8 each side · Bird dog 2 × 8 each side · Glute bridge 2 × 15 · Cat-cow 1 × 10 · World's greatest stretch 1 × 5 each side.

### Shared notes (show on workout days, collapsed or small)
- Warm up 5 min with arm circles, plus 1 light set of the first exercise.
- Rest 60–90 s. Last 2 reps should be hard but clean.
- All 3 sets felt easy? Add 5 lb next time.

### Rest day note
"Rest day. A walk or light stretching is a good addition." Optionally show "Next workout: Wed — Workout B".

## Screens
1. **Today** (only screen needed for v1)
   - Date at top (e.g. "Wednesday, Oct 28").
   - Rest day: large "Rest day" heading, the rest note, and the next workout day + letter.
   - Workout day: "Workout A" / "Workout B" heading, then five cards: exercise name, sets × reps, starting weight.
   - Large, readable text; one-hand phone use; respects light/dark mode.

## Tech
- Suggested: Vite + React + TypeScript (or plain HTML/JS if simpler). No backend, no login.
- Make it a **PWA** (manifest + icon + service worker) so I can "Add to Home Screen" on iPhone and it opens offline.
- Keep `getTodayPlan(date: Date) → { type: "rest", next } | { type: "workout", letter, exercises }` as a pure function in its own module, so it can be ported to Swift later.
- Easy static hosting (GitHub Pages, Netlify, or Vercel). Include short deploy instructions in the README.

## Tests (unit tests for the day logic)
With `PROGRAM_START_MONDAY = 2026-10-26`:
- Mon 2026-10-26 → Workout A
- Tue 2026-10-27 → Rest
- Wed 2026-10-28 → Workout B
- Fri 2026-10-30 → Workout C
- Sat 2026-10-31 / Sun 2026-11-01 → Rest
- Mon 2026-11-02 → Workout A (same every week)
- A date before the start (e.g. Mon 2026-10-19) → Workout A (no crash)
- A two-week rotation still alternates correctly, including across the Nov 1 DST change.

## Added after v1
- Swipe a card left to log a set (right to undo), with a per-exercise weight stepper; each session starts at the weight last used.
- History screen and JSON export; data is stored on the device.
- Muscle groups shown on each exercise.
- Optional rest-day session (legs & core at first; core & mobility since the full-body rebalance).
- Workout C and a fixed Mon A / Wed B / Fri C week.
- Full-body rebalance: legs and chest spread across A/B/C.

## Out of scope for now (possible later)
- Logging actual reps when short of the target.
- Settings screen to change workout days or start date.
- Native iOS app (SwiftUI) reusing the same data and day logic.