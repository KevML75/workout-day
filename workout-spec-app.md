# Workout Day App — Build Spec

## Goal
A tiny web app that, when opened, tells me what to do **today**:
- **Rest day** → a simple "Rest day" screen, nothing else.
- **Workout day** → the name of the workout (A or B) and its five exercises, each with sets, reps and starting weight.

Must work well on an iPhone (I'll mostly open it on my phone). A native iOS app may come later, so keep the workout data and day logic separate from the UI so they can be reused.

## Equipment context
PowerBlock Elite EXP 90 adjustable dumbbells (5–90 lb per dumbbell, 2.5 lb increments with the adder weights). No bench assumed; a chair works for one-arm rows.

## Schedule rules
- Workout days: **Monday, Wednesday, Friday**. All other days are rest days.
- Workouts alternate across the week:
  - **Odd program weeks:** Mon = A, Wed = B, Fri = A
  - **Even program weeks:** Mon = B, Wed = A, Fri = B
- Program week 1 starts on a configurable Monday: `PROGRAM_START_MONDAY = "2026-10-26"`.
  - `weekIndex = floor((today − PROGRAM_START_MONDAY) in days / 7)`; week is "odd" when `weekIndex` is even (week 1, 3, 5…). Use a proper modulo so dates before the start date don't break.
- Use the **device's local date** (not UTC). I'm in America/Los_Angeles, so a late-evening open must not jump to the next day.

## Workout data
Store this as a single data file (e.g. `workouts.json` or a typed `workouts.ts`), not hard-coded in components.

### Workout A
| # | Exercise | Sets × Reps | Starting weight |
|---|----------|-------------|-----------------|
| 1 | Overhead press | 3 × 10 | 15–25 lb |
| 2 | One-arm row | 3 × 10 each arm | 25–35 lb |
| 3 | Lateral raise | 3 × 12 | 5–10 lb |
| 4 | Biceps curl | 3 × 10 | 15–20 lb |
| 5 | Overhead triceps extension | 3 × 10 | 20–25 lb (one dumbbell) |

### Workout B
| # | Exercise | Sets × Reps | Starting weight |
|---|----------|-------------|-----------------|
| 1 | Bent-over two-arm row | 3 × 10 | 20–30 lb |
| 2 | Rear delt fly | 3 × 12 | 5–10 lb |
| 3 | Dumbbell shrug | 3 × 12 | 30–40 lb |
| 4 | Hammer curl | 3 × 10 | 15–20 lb |
| 5 | Triceps kickback | 3 × 12 | 10–15 lb |

### Shared notes (show on workout days, collapsed or small)
- Warm-up 5 min: arm circles, then 1 light set of the first exercise.
- Rest 60–90 s between sets.
- Last 2 reps should be hard with clean form; adjust by 5 lb if not.
- When all 3 sets hit the top reps, move the pin up 5 lb next session.
- Make sure the selector pin is fully seated before each set.

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
- Fri 2026-10-30 → Workout A
- Sat 2026-10-31 / Sun 2026-11-01 → Rest
- Mon 2026-11-02 → Workout B
- Wed 2026-11-04 → Workout A
- Fri 2026-11-06 → Workout B
- Mon 2026-11-09 → Workout A
- A date before the start (e.g. Mon 2026-10-19) → Workout B (no crash, consistent alternation)

## Out of scope for v1 (possible later)
- Logging weights/reps per set and remembering last session's weight.
- "Done" checkmarks per exercise.
- Settings screen to change workout days or start date.
- Native iOS app (SwiftUI) reusing the same data and day logic.