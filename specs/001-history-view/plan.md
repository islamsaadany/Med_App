# Implementation Plan: History View

**Branch**: `001-history-view` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-history-view/spec.md`

## Summary

Add a read-only History view over the existing 60-day tick log: per-day adherence
(taken vs expected, complete/partial/none/nothing-scheduled), a current-streak counter,
and a per-medication drill-down. Everything is derived at render time from data the app
already stores (`meds:v3`, `medlog:v4`); no storage shape changes, no API changes, no
new dependencies. Implementation is a fourth view inside `index.html` following the
exact patterns of the existing travel-calculator view.

## Technical Context

**Language/Version**: Vanilla ES2020+ JavaScript, single-file HTML/CSS/JS (`index.html`)

**Primary Dependencies**: None (constitution I). Google Fonts already present.

**Storage**: Existing `store` wrapper keys only — `meds:v3`, `medlog:v4` read-only for
this feature; `medui:v1` gains no new persisted fields (drill-down state is transient).

**Testing**: Headless Chromium via playwright-core (scratchpad harness, mock static
server), per constitution V. Scenario script seeds a known log through the page context.

**Target Platform**: iPhone Safari PWA first (390px), desktop second; both themes.

**Project Type**: Static PWA front-end + one existing Vercel function (untouched).

**Performance Goals**: History render ≤ a frame or two — worst case 60 days × ~15 meds
× 3 meals of pure array work; no perceptible delay on a phone.

**Constraints**: Offline-first, zero writes (spec FR-008), zero sync pushes (SC-003),
no re-render of the checklist patterns that lose scroll state (constitution IV).

**Scale/Scope**: One new view, ~1 render function + 2 pure helpers, ~80 lines CSS.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. One File Is the Point | All code lands in `index.html`; no new files, deps, or api/ changes | PASS |
| II. Meals, Not Clocks | Day summaries count med×meal slots; per-med view shows meal slots; scheduling goes through `effStart`-based `activeOn` | PASS |
| III. Offline-First, Device-Primary | Read-only over local data; no new synced shape, so no new merge rules needed | PASS |
| IV. Calm UI, No Lost State | Day expansion toggles a class on the row (no list re-render); colours only via palette vars + `color-mix` | PASS |
| V. Verified in a Real Browser | Quickstart defines a seeded-log Playwright scenario incl. both themes at 390px | PASS |

No violations → Complexity Tracking left empty.

**Post-design re-check (after Phase 1)**: unchanged — the design introduces only
derived, in-memory entities and one DOM view. PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-history-view/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
index.html               # everything: new #viewHist markup, history CSS block,
                         #   history JS module (helpers + renderHistory + navigation hooks)
CLAUDE.md                # layout notes updated in the same commit
```

**Structure Decision**: Single-file front-end (constitution I). The history module
slots into the established script order — after the travel calculator, before the
configuration render — and copies the travel view's structural pattern (a `.view`
container, a render function, `setTab` wiring). No `contracts/` directory: the feature
exposes no external interface (no API, no storage shape, no URL surface); the internal
UI contract is captured in data-model.md instead.

## Complexity Tracking

> No constitution violations — table intentionally empty.
