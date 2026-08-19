# Doses — project notes

A medication checklist. One page, no build step, no dependencies, no server, no account.
Everything is in `index.html` — markup, styles and logic in that order. Keep it that way
unless there's a real reason not to; the single file is the point.

## Layout of index.html

- `<style>` — CSS custom properties at the top define the whole palette. Change colours there, not inline.
- `<body>` — header (title, date, progress bar, two icon buttons), meal subtabs, three views, the add/edit modal.
- `<script>` — in order: storage wrapper, date maths, the seeded prescription, state, label helpers,
  checklist render, travel calculator, configuration render, navigation, modal.

## Concepts

- **No clock times.** A dose is anchored to a meal (`breakfast` / `lunch` / `dinner`), a relation
  (`before` / `with` / `after`) and a `gap` in minutes. The checklist groups by relation+gap and puts
  the timing in the group heading, so cards stay minimal.
- **Courses.** `start` (ISO date) + `days`. `days: null` means ongoing, no counter.
- **Dependencies.** `after: <med id>` means this starts the day after that one finishes.
  `effStart()` resolves the chain recursively and guards against cycles; nothing else should
  read `m.start` directly for scheduling — go through `effStart`.
- **`ui.detail`** toggles the simple/detailed card view via a `detailed` class on `<body>`; the
  hiding is pure CSS, scoped to `#day`.

## Storage

`store.get/set` tries `window.storage` (Claude artifact host), then `localStorage`, then memory.
Keys: `meds:v3`, `medlog:v3`, `medui:v1`. Bump the version suffix on any breaking shape change —
old data is not migrated.

`log` is `{ 'YYYY-MM-DD': ['medId|meal', ...] }`, pruned to 60 days.

The seed list in `SEED` only loads when `meds:v3` is absent, i.e. first run on a device.

## Gotchas

- Ticking a dose must **not** re-render. `toggle()` patches the one card and calls `updateCounts()`.
  Calling `render()` there replays every animation and loses scroll position.
- The service worker serves the page network-first. If a deploy doesn't appear,
  bump `VERSION` in `sw.js` (`doses-v1` → `doses-v2`).
- `color-scheme: light only` is deliberate — phones force-darken pages that don't declare it.
- No `localStorage` assumptions: it throws in some sandboxes, hence the wrapper.

## Not built yet

- Backup export / import (data lives only in one browser install — deleting it loses everything).
- Notifications. Real alarms need a service worker push or a native app; the browser can only
  nudge while the page is open.
- A dark theme.
