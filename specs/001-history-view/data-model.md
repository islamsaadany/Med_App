# Data Model: History View

All entities are **derived in memory at render time**. Nothing here is stored,
synced, or versioned; the persisted shapes (`meds:v3`, `medlog:v4`) are unchanged
and read-only for this feature (spec FR-008).

## Source shapes (existing, read-only)

- **Med** (`meds:v3` entry): `{ id, name, dose, meals:[mealId], rel, gap, start,
  days, course, note, after }` — course window resolved via `effStart(m)`;
  activity on a date via `activeOn(m, dateStr)`.
- **Log** (`medlog:v4`): `{ 'YYYY-MM-DD': { 'medId|meal': { t: ISO, on: bool } } }`
  — read exclusively through `takenOn(dateStr)` (returns keys with `on:true`).

## Derived entities

### DaySummary

One per rendered day, newest first.

| Field | Type | Rule |
|---|---|---|
| `date` | `'YYYY-MM-DD'` | walked back from today (R3 window rule) |
| `expected` | `string[]` of `'medId|meal'` | every current med with `activeOn(m, date)`, one key per meal in `m.meals` |
| `taken` | `string[]` | `takenOn(date) ∩ expected` — phantom ticks ignored |
| `missed` | `string[]` | `expected − taken` |
| `state` | `'idle' \| 'full' \| 'part' \| 'miss'` | idle: expected empty · full: taken == expected · part: 0 < taken < expected · miss: taken 0 |
| `isToday` | `bool` | labels the row and feeds the streak rule |

Validation: `taken.length + missed.length === expected.length` always.

### Streak (integer, derived)

Walk DaySummaries newest → oldest: `idle` passes through; today counts only when
`full` and never breaks; first older day that is neither `full` nor `idle` stops
the walk. Result = count of `full` days seen.

### PerMedDay

One per day in per-med drill-down mode, for the selected med `m`:

| Field | Type | Rule |
|---|---|---|
| `date` | `'YYYY-MM-DD'` | window days where `activeOn(m, date)` |
| `slots` | `{ meal, taken: bool }[]` | one per `m.meals`, taken iff `medId|meal` ∈ `takenOn(date)` |

## Transient UI state (never persisted)

- `histBack: 'today' | 'setup'` — where the gear returns to (R1).
- `histMed: medId | null` — non-null while in per-med mode (R5).
- Expanded day rows — DOM class only, reset on re-render.

`ui` (persisted `medui:v1`) is **not** extended; `ui.tab` may transiently hold
`'history'` like it already holds `'trip'`.

## UI contract (internal)

- `#viewHist` — fourth `.view` container; `setTab('history')` shows it, hides the
  progress bar/filters/eye exactly as `'trip'` does, and titles the header
  ("History" eyebrow / "How it's <em>going</em>" title).
- `renderHistory()` — idempotent, writes only into `#viewHist`, performs zero
  `store.set` calls (SC-003 asserts this).
- Day row tap → toggles `open` class on that row only.
- Med name tap in day detail → per-med mode; "← All days" → summary mode.
