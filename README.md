# Workout Day

A tiny phone-first web app that tells you what to do today: a rest day, or Workout A/B
with five dumbbell exercises. Swipe a card left to log a set at the selected weight, swipe
right to undo. Past sessions are under **History**, and **Export history (JSON)** saves a
backup file. Works offline once added to the iPhone home screen.

The spec is in [workout-spec-app.md](workout-spec-app.md).

## Develop

```sh
npm install
npm run dev            # http://localhost:5173
npm run dev -- --host  # also reachable from your phone on the same Wi-Fi
npm test               # unit tests for the day plan and log logic
npm run build          # production build in dist/
```

In dev mode, `?date=2026-10-27` previews another day (ignored in production builds).

## Project layout

| Path | What |
|------|------|
| `src/data/workouts.ts` | Program data: schedule, start Monday, workouts, notes |
| `src/logic/plan.ts` | `getTodayPlan(date)`: pure, portable day logic |
| `src/logic/log.ts` | Pure set/weight logging logic |
| `src/logic/history.ts` | Pure history summaries |
| `src/historyStore.ts` | Saves history in the browser (`localStorage`) and exports JSON |
| `src/App.tsx`, `src/HistoryScreen.tsx` | UI |

Everything under `src/data` and `src/logic` has no UI dependencies, so it can be ported to
Swift for a native app later.

## Deploy (GitHub Pages)

1. Create an empty GitHub repo and push this project to its `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs the tests, builds, and deploys via
   `.github/workflows/deploy.yml`. The site appears at
   `https://<user>.github.io/<repo>/`.

The build uses relative paths, so no repo-name configuration is needed. Netlify or Vercel
also work: build command `npm run build`, output directory `dist`.

## Install on iPhone

Open the site in Safari → Share → **Add to Home Screen**. It then opens full screen and
works offline. Updates download in the background and apply on the next launch.

## Your data

Workout history lives only in the browser storage of the device and site address where it
was logged: it doesn't sync, and data logged on a dev address doesn't carry over to the
deployed site. Clearing Safari website data deletes it, so use **Export history (JSON)**
now and then as a backup.
