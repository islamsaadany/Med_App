# Tasks: Care Calendar

**Input**: Design documents from `/specs/002-care-calendar/`
**Tests**: One scripted browser scenario per quickstart.md (constitution V).
**Organization**: Single-file front-end — sequential edits to `index.html`.

## Phase 1: Foundational

- [x] T001 Storage + state in `index.html`: `K_CARE='care:v1'`, `care=[]`,
      load/parse in `load()`, `saveCare()` (bump `careTs`, persist, pushSoon),
      prune rule, `visitDate(v)`/`courseEnd(m)` helpers per data-model
- [x] T002 Sync: client push/pull carries `care`+`careTs` (adopt via
      `store.set`, LWW on `care_updated`) in `index.html`; server
      `api/sync.js` gains `care jsonb`/`care_updated text` columns
      (ADD COLUMN IF NOT EXISTS) and keeps stored care when POST omits it;
      extend scratchpad mock server the same way
- [x] T003 Med-delete handler in `index.html` freezes anchored visits
      (date = visitDate, after = null)

## Phase 2: US1+US2 — visits and tests (P1)

- [x] T004 [US1] `#vsheet` markup + JS in `index.html`: title, note, anchor
      segment (fixed date | after course + offset 0–30), tests editor
      (name + days-before rows, add/remove), save/cancel/delete
- [x] T005 [US1] FAB dispatch in `index.html`: label/action per view
      (setup → med sheet, calendar → visit sheet); visible only there

## Phase 3: US3 — the calendar view (P2)

- [x] T006 [US3] `#viewCal` markup, `setTab('cal')`, header calendar icon
      `#calBtn` (today view) + setup button `#calSetupBtn`, `calBack` return
- [x] T007 [US3] `renderCal()` in `index.html`: Friday-start month grid
      (lead-in `(dow−5+7)%7`), prev/next, today highlight, kind-coloured dots,
      day tap → `calSel` highlight section
- [x] T008 [US3] Agenda in `renderCal()`: overdue undone flagged on top,
      upcoming 60 days in date order, course ends informational, done-toggle
      on visit/test rows (saveCare + re-render cal only), tap body → edit sheet
- [x] T009 [US3] Calendar CSS block in `index.html` (palette vars +
      color-mix only, 390px-safe, both themes)

## Phase 4: US4 — in-app notifications (P3)

- [x] T010 [US4] Due/overdue scan + `#careNote` banner on checklist in
      `render()`; dot on `#calBtn`; tap opens calendar (`index.html`)

## Phase 5: Polish

- [x] T011 Full quickstart run (checks 1–8) + sync & history regressions;
      both-theme screenshots
- [ ] T012 `sw.js` VERSION bump and `CLAUDE.md` done; merge to main BLOCKED —
      awaiting the user's approval of the visual mockup (screens shared
      2026-08-19); do not merge until they approve

## Dependencies

T001 → everything; T002 independent of T004–T010 except shared `saveCare`;
T004 before T005; T006 before T007–T010.
