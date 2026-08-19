# Implementation Plan: Care Calendar

**Branch**: `claude/app-build-together-og1ruj` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

## Summary

Fifth view in `index.html`: a Friday-start month grid plus an upcoming agenda,
fed by a new stored care list (visits with embedded tests) and by derived
medication course endings. Visit dates anchor to course ends through the
existing `effStart` logic; test dates derive from their visit. In-app
notifications surface due/overdue items on the checklist. Sync extends the
existing row with a `care` column, whole-list LWW on its own timestamp.

## Technical Context

**Language/Version**: Vanilla JS in `index.html`; `api/sync.js` gains one column.

**Storage**: New key `care:v1` = `[Visit]`; `medsync:v1` gains `careTs`.
Server: `doses_state` gains `care jsonb` + `care_updated text`
(`ADD COLUMN IF NOT EXISTS`, backwards-compatible). POSTs without a `care`
field must not overwrite stored care data (old clients).

**Testing**: Playwright scenario per quickstart; mock server extended to store
`care`/`care_updated`; sync regression re-run.

**Target/Constraints**: 390px, both themes, offline-first, no push notifications.

## Constitution Check

| Principle | Check | Status |
|---|---|---|
| I. One File | All UI in index.html; server change is one column in the existing function | PASS |
| II. Meals, Not Clocks | Day-granular; anchors resolve via effStart family; no clock times | PASS |
| III. Offline-First | Merge rule declared in spec FR-007 (whole-list LWW on careTs); old clients can't wipe care data | PASS |
| IV. Calm UI | Palette vars + color-mix only; done-toggles patch state and re-render only the calendar view | PASS |
| V. Verified | Seeded browser scenario incl. anchor-shift, Friday grid, sync propagation, both themes | PASS |

Post-design re-check: PASS (no new violations).

## Key design decisions (research inline — no open unknowns)

- **R1 Course end**: `courseEnd(m) = effStart(m) + m.days − 1` (last dosing
  day). Anchored visit date = courseEnd + offset (0 = the last dosing day,
  1 = the day after finishing). UI wording: "days after it finishes".
- **R2 Anchor freeze on delete**: deleting a med rewrites anchored visits to
  fixed dates (same handler that already re-roots dependent meds).
- **R3 Friday grid**: column order Fr Sa Su Mo Tu We Th; lead-in =
  `(firstWeekday − 5 + 7) % 7` with JS `getDay()` (Fri = 5).
- **R4 Agenda window**: overdue = undone items in the last 60 days (top,
  flagged); upcoming = next 60 days, date order; course ends informational.
- **R5 Sheets**: a second, dedicated sheet (`#vsheet`) for visits — the med
  sheet stays untouched. Tests edited inline in the visit sheet (name +
  days-before rows, add/remove).
- **R6 FAB**: label/action switch per view — setup → "+ Add medication",
  calendar → "+ Add doctor visit"; hidden elsewhere.
- **R7 Banner**: computed in `render()` from due/overdue undone items;
  singular names the item, plural shows a count; tap opens the calendar.
  Dot on the header calendar icon under the same condition.
- **R8 Sync**: `care` pushed alongside meds/log; pull adopts server care when
  `care_updated` is newer (write via `store.set`, never `saveCare`). Pushes
  always include `care`, so this client never regresses another's care list;
  the server keeps stored care when a POST omits the field.

## Project Structure

```text
specs/002-care-calendar/{plan.md,data-model.md,quickstart.md,tasks.md}
index.html      # calendar CSS block, #viewCal + #vsheet markup, care module JS
api/sync.js     # care/care_updated column + conditional upsert
sw.js           # VERSION bump
CLAUDE.md       # updated map
```

## Complexity Tracking

> No violations — empty.
