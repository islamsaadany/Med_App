# Tasks: History View

**Input**: Design documents from `/specs/001-history-view/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Browser-verification scenario is mandated by constitution V and quickstart.md
(not TDD-style unit tests — one scripted Playwright scenario validating all stories).

**Organization**: Single-file front-end — every implementation task edits `index.html`,
so tasks within a phase are sequential (no [P] on same-file edits). The validation
harness lives in the session scratchpad (not committed), per the sync feature's precedent.

## Phase 1: Setup

- [x] T001 Confirm working tree clean on branch `claude/app-build-together-og1ruj` and dev server + Playwright harness runs against repo root (scratchpad `mock-server.cjs`)

## Phase 2: Foundational (blocking for all stories)

- [x] T002 Add `#viewHist` view container markup (empty `<div id="hist">` inside a `.view`) after `#viewTrip` in `index.html`
- [x] T003 Extend `setTab()` in `index.html` to handle `'history'` (hide bar/filters/eye, eyebrow "History", title "How it's <em>going</em>", gear = back) and add transient `histBack` return-target variable per research R1
- [x] T004 Add entry points in `index.html`: click on `#barWrap` (progress area) opens history with `histBack='today'`; new button `#histBtn` ("History — how you've been doing", `.btn.trip` style) at top of `#viewSetup` with `histBack='setup'`; gear click from history returns to `histBack`
- [x] T005 Add pure helpers in `index.html` history module: `expectedOn(dateStr)` (activeOn × meals → keys) and `daySummary(dateStr)` (expected/taken/missed/state per data-model.md), plus window-walk producing the day list per research R3

## Phase 3: User Story 1 — Did I take everything the last few days? (P1) 🎯 MVP

**Goal**: Open History, see each recent day's taken/expected counts and state; tap a day for its missed doses; today included live.

**Independent test**: Quickstart checks 1, 2, 6 pass on the seeded scenario.

- [x] T006 [US1] Implement `renderHistory()` summary mode in `index.html`: day rows (date label, `taken of expected`, state pip/bar; "Today" label; idle rows say "nothing scheduled"), window caption "History keeps 60 days"
- [x] T007 [US1] Implement day-row inline detail toggle in `index.html`: tap toggles `open` class only (no list re-render); detail lists missed doses as "med — meal" or "Everything taken"
- [x] T008 [US1] Add history CSS block in `index.html` `<style>`: `.hday` rows, state colours via palette vars + `color-mix` only (full=green, part=ochre, miss=clay, idle=dim), open/detail styles, 390px-safe
- [x] T009 [US1] Wire live refresh in `index.html`: `render()` calls `renderHistory()` when `ui.tab==='history'`
- [x] T010 [US1] Validate US1 via quickstart checks 1, 2, 6 (seeded Playwright scenario incl. zero-`store.set` spy baseline)

## Phase 4: User Story 2 — Current streak (P2)

**Goal**: Streak header per Story 2 rules (idle passes through, today only when complete).

**Independent test**: Quickstart check 3 passes on constructed logs.

- [x] T011 [US2] Implement `streakFrom(days)` pure helper in `index.html` per data-model.md streak rules
- [x] T012 [US2] Render streak header in `renderHistory()` (`.totals`-style box: streak count + adherence-window note) in `index.html`
- [x] T013 [US2] Validate US2 via quickstart check 3 (streak before/after completing today)

## Phase 5: User Story 3 — Per-medication history (P3)

**Goal**: From a day detail, tap a med to see its per-day meal marks within its course window; back returns to summary.

**Independent test**: Quickstart check 4 passes.

- [x] T014 [US3] Implement per-med mode in `index.html`: transient `histMed`, med-name tap in day detail enters it, "← All days" button leaves it; per-day rows show one mark per scheduled meal (taken/missed) per data-model.md PerMedDay
- [x] T015 [US3] Extend history CSS in `index.html` for per-med rows/marks (palette vars only)
- [x] T016 [US3] Validate US3 via quickstart check 4

## Phase 6: Polish & Cross-Cutting

- [x] T017 Full quickstart run: checks 1–7 including read-only spy (SC-003), both-theme 390px screenshots (SC-004), zero page errors
- [x] T018 Update `CLAUDE.md` (layout: fourth view + history module; concepts: derived day summaries; "Not built yet" list) in the same commit
- [x] T019 Mark tasks complete in `specs/001-history-view/tasks.md`, set spec Status to Implemented, commit feature + push

## Dependencies

- Phase 2 blocks everything; T005 blocks T006 and T011.
- US1 (Phase 3) blocks US2's rendering slot (T012 renders inside `renderHistory()`)
  and US3's entry point (T014 enters from T007's day detail).
- US2 and US3 are independent of each other.

## Parallel example

Single-file feature — no same-phase parallelism. US2 (T011–T013) and US3 (T014–T016)
could proceed in either order once US1 is done.

## Implementation strategy

MVP = Phase 3 (US1) alone is shippable. Deliver US1 → validate → US2 → US3 → polish.
