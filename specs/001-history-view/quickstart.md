# Quickstart: validating the History View

## Prerequisites

- Any static file server over the repo root (`python3 -m http.server 8322`), or the
  scratchpad `mock-server.cjs` (also stubs `/api/sync`, though History never calls it).
- Headless Chromium + playwright-core (as used for the sync feature's validation).

## Seeded scenario

Before loading the page, seed deterministic data via `localStorage`:

- `meds:v3`: 3 meds — A (breakfast+lunch, started 10 days ago, 30 days),
  B (dinner, started 5 days ago, 10 days), C (breakfast, starts tomorrow — must not
  appear in history).
- `medlog:v4`: yesterday fully ticked; 2 days ago missing one of A's slots;
  3 days ago empty; 6 days ago (before B started) A fully ticked.

## Checks (map to spec success criteria)

1. **Day counts/states (SC-002, FR-002/003)** — for each seeded day, the row shows
   the hand-computed `taken of expected` and state: yesterday `full`, 2-days-ago
   `part`, 3-days-ago `miss`, 6-days-ago `full` (expected only counts A then),
   pre-course days `idle` ("nothing scheduled"). At least 14 rows render.
2. **Day detail (FR-004)** — tapping the `part` day reveals exactly the missed
   "A — Lunch" line; tapping the `full` day shows "Everything taken".
3. **Streak (FR-005, Story 2)** — with today untouched, streak counts from
   yesterday back to the first non-full day; tick all of today's doses, reopen
   History, streak grows by one.
4. **Per-med drill-down (FR-006)** — tap med A in the day detail: rows only for
   days where A was active, each with one mark per meal slot; "← All days" returns.
5. **Read-only (SC-003, FR-008)** — a `store.set` spy installed before opening
   History records zero calls while browsing it (summary, details, per-med, back).
6. **Entry points (SC-001, FR-001)** — from the checklist, tapping the progress
   area opens History (1 interaction); the setup view has the History button;
   gear returns to where History was opened from.
7. **Themes/layout (SC-004)** — screenshots at 390×844 in light and dark show
   palette-consistent rows (no hard-coded colours; verify visually).

## Run

The checks live in a scripted Playwright scenario (see tasks.md T-quickstart task);
run it headless against the local server and read the pass/fail log + screenshots.

Expected outcome: every check above prints `true`/expected values, zero page errors.
