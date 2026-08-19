# Research: History View

All unknowns from Technical Context resolved below. No external technology research
was needed (zero new dependencies); the open questions were design decisions inside
the existing codebase.

## R1 — Entry point / navigation (spec FR-001, SC-001)

- **Decision**: Two entries, one view:
  1. Tapping the progress bar block in the header of the checklist opens History
     (satisfies SC-001: one interaction from the checklist).
  2. A `History — how you've been doing` button at the top of the setup view,
     styled and placed like the existing travel-calculator button.
  The gear/back button returns to wherever History was opened from (transient
  variable, not persisted). `ui.tab` value `'history'` is handled in `setTab` like
  `'trip'`; on load the app still always opens on the checklist (existing behaviour).
- **Rationale**: No fourth persistent tab (FR-001 forbids it); reuses two familiar
  affordances; the progress bar is the natural "how am I doing?" surface.
- **Alternatives considered**: Only a setup-view button (fails SC-001's one-glance
  goal from the checklist); a fourth meal-tab-like filter (rejected by FR-001);
  long-press gestures (undiscoverable, non-standard on iOS Safari).

## R2 — Expected doses for a past day (FR-003, edge cases)

- **Decision**: `expectedOn(dateStr)` = for every current med where
  `activeOn(m, dateStr)` is true, one key `m.id + '|' + meal` per meal in `m.meals`.
  Taken = intersection of that expected set with `takenOn(dateStr)`. Ticks not in the
  expected set (deleted meds, changed meals) are ignored per spec edge cases.
- **Rationale**: `activeOn` already encodes course windows incl. dependency chains via
  `effStart` (it is what the travel calculator trusts); intersection cleanly implements
  "phantom rows are ignored".
- **Alternatives considered**: Storing daily schedule snapshots (rejected in spec
  assumptions — new synced shape, needs merge rules, violates scope); counting raw
  ticks without intersection (shows phantom/over-100% days).

## R3 — Window rule (FR-002)

- **Decision**: Walk back from today up to 60 days building day summaries. Show at
  least 14 days; beyond 14, keep extending only while a day has any log entry or any
  scheduled dose, and stop at the first older day with neither. Cap at 60. A caption
  under the list states the window ("History keeps 60 days").
- **Rationale**: Directly implements FR-002's `min(60, days with data-or-schedule,
  floor 14)`; avoids rendering 46 empty rows for a fresh install.
- **Alternatives considered**: Fixed 60 always (noisy); fixed 14 with a "more" button
  (an extra interaction the rule makes unnecessary).

## R4 — Day states and streak (FR-002, FR-005, Story 2)

- **Decision**: State per day: `idle` (expected 0), `full` (taken == expected > 0),
  `part` (0 < taken < expected), `miss` (taken 0, expected > 0). Today renders with
  its live counts and a "Today" label; it is state `full` only when complete.
  Streak: iterate today → older; `idle` days pass through without counting; today
  counts only if `full`, otherwise it is skipped without breaking; the first non-today
  day that is not `full` and not `idle` ends the streak.
- **Rationale**: Exactly the rules in Story 2's acceptance scenarios.
- **Alternatives considered**: Percent-based "good enough" days (spec says complete);
  counting idle days into the streak number (inflates it misleadingly).

## R5 — Day detail and per-med drill-down (FR-004, FR-006)

- **Decision**: Tapping a day row toggles an inline detail block inside the row
  (class toggle, no list re-render — constitution IV). The detail lists missed doses
  as "med — meal" lines (or "Everything taken"); each med name in the detail is
  tappable and switches the history view into a per-med mode: rows per day within
  window ∩ course showing one mark per scheduled meal (taken/missed), with an
  "← All days" button to return. Per-med mode is transient state, never persisted.
- **Rationale**: Satisfies FR-004 and FR-006 with zero new navigation chrome; the
  inline expansion pattern is calmer than a modal and keeps the sheet free for its
  existing add/edit job.
- **Alternatives considered**: Reusing the modal sheet for day detail (heavier, and
  the sheet is semantically "edit"); separate `ui.tab` for per-med (pollutes persisted
  UI state with a transient drill-down).

## R6 — Live updates while History is open (Story 1 scenario 4)

- **Decision**: `render()` gains one line: when `ui.tab === 'history'` it also calls
  `renderHistory()`. Sync pulls that change data already call `render()`; ticking
  can't happen while History is open (different view), so no further wiring needed.
- **Rationale**: Minimal, uses the existing "pull → render" path.
- **Alternatives considered**: A storage observer (over-engineering for one view).

## R7 — Validation harness (constitution V)

- **Decision**: Extend the scratchpad Playwright scenario: seed a deterministic
  multi-day log by writing `medlog:v4` through `localStorage` before load, then
  assert day counts, states, streak, day-detail contents, per-med marks, zero
  storage writes (spy on `store.set`), and screenshot light + dark at 390px.
- **Rationale**: Same harness that validated sync; SC-002/SC-003/SC-004 all
  checkable in one run.
- **Alternatives considered**: Unit-testing helpers in Node (the helpers read app
  globals; browser-context testing exercises the real thing).
