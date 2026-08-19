# Doses — project notes

A medication checklist. The front-end is one page, no build step, no dependencies, no
account. Everything client-side is in `index.html` — markup, styles and logic in that
order. Keep it that way unless there's a real reason not to; the single file is the point.
The only server code is `api/sync.js`, a Vercel function over a Neon Postgres database
(one table), used solely for optional cross-device sync.

## Layout of index.html

- `<style>` — CSS custom properties at the top define the whole palette, once for light
  (`:root`) and once for dark (`html.dark`). Change colours there, not inline. Tints are
  `color-mix(...)` over the palette vars so both themes get them for free — never add a
  hard-coded rgba/hex tint. Text on solid accent backgrounds is `--on-accent`.
- `<body>` — header (title left; theme/detail/config icon buttons and the date right,
  date bottom-aligned to the title), segmented meal tabs, four views (checklist, setup,
  travel, history), the sync section inside the setup view, the add/edit modal.
- `<script>` — in order: storage wrapper, date maths, the seeded prescription, state, label
  helpers, checklist render, travel calculator, history view, configuration render,
  navigation, theme, modal, sync.

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
- **History** is derived entirely at render time (day summaries, streak, per-med record) from
  meds + log — it never writes and has no stored state. `expectedOn(date)` = active meds ×
  their meals via `activeOn`; taken = intersection with `takenOn(date)`, so ticks for deleted
  meds are ignored. Entry points: tapping the date on the checklist, or the button in
  setup; `histBack`/`histMed` are transient, never persisted. Spec: `specs/001-history-view/`.

## Storage

`store.get/set` tries `window.storage` (Claude artifact host), then `localStorage`, then memory.
Keys: `meds:v3`, `medlog:v4`, `medui:v1`, `medsync:v1`. Bump the version suffix on any breaking
shape change; `medlog:v4` migrates from a `medlog:v3` (plain arrays) it finds, others start fresh.

`log` is `{ 'YYYY-MM-DD': { 'medId|meal': { t:'ISO time', on:bool } } }`, pruned to 60 days.
Unticks are records too (`on:false`) — that is what lets devices merge (see Sync). Read the
day's taken list through `takenOn(dateStr)`, never the raw shape.

The seed list in `SEED` only loads when `meds:v3` is absent, i.e. first run on a device.

## Sync

Offline-first: the device copy is what the app runs on; `api/sync.js` stores one row per
sync code in Neon (`doses_state`, created on first use, `DATABASE_URL` comes from Vercel's
Neon integration). Semantics, all client-side in the sync module at the bottom of the script:

- meds: last-write-wins on one timestamp for the whole list (`sync.medsTs`, bumped by
  `saveMeds`). When a pull adopts server meds it writes through `store.set` directly, NOT
  `saveMeds` — adopting must not bump the timestamp.
- log: merged per entry, newest `t` wins; ticks and unticks propagate equally.
- pending debounced pushes are flushed before every pull (`pullSync` head).
- the sync code is the only credential; codes are generated with ~60 bits of entropy.

## Gotchas

- Ticking a dose must **not** re-render. `toggle()` patches the one card and calls `updateCounts()`.
  Calling `render()` there replays every animation and loses scroll position.
- The service worker serves the page network-first. If a deploy doesn't appear,
  bump `VERSION` in `sw.js` (`doses-v2` → `doses-v3`).
- The service worker must never cache `/api/` — there's an early return for it; keep it.
- `color-scheme: light only` on the base, `dark` under `html.dark` — both deliberate, phones
  force-darken pages that don't declare a scheme. The `prefers-color-scheme` re-assert block
  uses vars only, so it's theme-neutral; don't put literal colours back in it.
- No `localStorage` assumptions: it throws in some sandboxes, hence the wrapper.

## Not built yet

- Notifications. Real alarms need a service worker push or a native app; the browser can only
  nudge while the page is open. Decided against for now.
- Refill/stock tracking ("N tabs left, runs out on the 12th").
