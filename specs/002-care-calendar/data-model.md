# Data Model: Care Calendar

## Stored (new key `care:v1`, synced)

**Visit** (array of):

| Field | Type | Rule |
|---|---|---|
| `id` | string | `'v' + Date.now()` |
| `title` | string | required |
| `note` | string | optional |
| `date` | `'YYYY-MM-DD' \| null` | fixed date; ignored while `after` set |
| `after` | medId \| null | anchor to a med with `days` |
| `offset` | int 0–30 | days after the course's last dosing day |
| `done` | bool | |
| `tests` | Test[] | embedded, no independent life |

**Test**: `{ id, name, before: int 0–30, done: bool }` — date = visit date − before.

**Sync meta** (`medsync:v1`): gains `careTs` (ISO), bumped by `saveCare()` only.

**Server** (`doses_state`): `+ care jsonb`, `+ care_updated text`
(added via `ADD COLUMN IF NOT EXISTS`). POST without `care` keeps stored values.

## Derived (never stored)

- `visitDate(v)` = `v.after` resolvable → `courseEnd(med) + v.offset`, else `v.date`;
  `courseEnd(m) = effStart(m) + m.days − 1`.
- **CalendarItem**: `{ date, kind: 'visit'|'test'|'end', label, sub, done, overdue, vId, tId }`
  built from visits, their tests, and every med with `days` (kind `end`).
- **Due/overdue set** for FR-010: undone visit/test items with date ≤ today
  (overdue when < today), scanned back 60 days.

## Transient UI state (never persisted)

- `calBack: 'today'|'setup'` — gear return target.
- `calMonth: {y, m}` — displayed month, defaults to today's.
- `calSel: 'YYYY-MM-DD' | null` — tapped grid day (highlights its items).
- `vdraft` — visit being edited in `#vsheet`.

## Mutation rules

- `saveCare()` = bump `careTs` → persist → `pushSoon()` (mirrors `saveMeds`).
- Adopting server care on pull writes via `store.set` directly (no ts bump).
- Deleting a med: anchored visits freeze (`date = visitDate(v)`, `after = null`)
  in the same handler that re-roots dependent meds.
- Deleting a visit removes its tests with it.
- Pruning: visits fully done with date older than 60 days are dropped on save.
