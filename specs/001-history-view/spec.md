# Feature Specification: History View

**Feature Branch**: `001-history-view`

**Created**: 2026-08-19

**Status**: Draft — awaiting user review

**Input**: User description: "Adherence history view over the 60-day tick log: per-day completion, streaks, and per-medication history"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Did I take everything the last few days? (Priority: P1)

The user opens a History view and sees the recent days at a glance — for each day,
how complete it was (all doses taken, partially taken, none, or nothing scheduled).
Days are shown meal-aware: a day's completion counts every active med × every one of
its meals for that day. Today is included and updates live as doses are ticked.

**Why this priority**: This is the core question the log exists to answer — "did I
miss anything yesterday?" — and it needs nothing but data the app already stores.

**Independent Test**: Seed a log with known ticks over several days, open History,
and confirm each day shows the correct taken/expected count and completion state.

**Acceptance Scenarios**:

1. **Given** yesterday had 6 expected doses and 6 ticks, **When** the user opens
   History, **Then** yesterday shows as complete (6 of 6).
2. **Given** a day had 6 expected doses and 4 ticks, **When** the user opens History,
   **Then** that day shows 4 of 6 with a partial state, and tapping it reveals which
   doses were missed (med + meal).
3. **Given** a day before any course had started, **When** the user opens History,
   **Then** that day shows as "nothing scheduled", not as a miss.
4. **Given** the user ticks a dose today while History is open on another device,
   **Then** the day's count reflects it after the next sync pull (no requirement for
   live push).

---

### User Story 2 - Current streak (Priority: P2)

The header of the History view shows the current streak: how many consecutive days
(ending today or yesterday) were fully complete. A day with nothing scheduled does
not break the streak; today only counts once complete.

**Why this priority**: Light motivation with zero new data. Streaks make adherence
tangible but are meaningless without Story 1's day states, hence P2.

**Independent Test**: Construct logs with a run of complete days, a gap day, and a
nothing-scheduled day; assert the computed streak matches expectations.

**Acceptance Scenarios**:

1. **Given** the last 5 days were fully complete and today is half done, **When** the
   user opens History, **Then** the streak shows 5 days.
2. **Given** yesterday was incomplete, **When** the user opens History, **Then** the
   streak counts only from today (0 until today completes).
3. **Given** a nothing-scheduled day inside a run of complete days, **Then** the
   streak continues through it.

---

### User Story 3 - Per-medication history (Priority: P3)

Tapping a medication (in the day detail, or from the configuration list) shows that
med's own record over the log window: which of its scheduled med-meal doses were
taken, per day — e.g. to answer a doctor's "have you been taking the Lanex?".

**Why this priority**: Valuable at the doctor's office, but a drill-down on top of
Stories 1–2 rather than a prerequisite for them.

**Independent Test**: For one med active 10 of the last 14 days with known ticks,
the per-med view shows exactly those 10 days with correct per-meal marks.

**Acceptance Scenarios**:

1. **Given** a med scheduled breakfast+lunch daily, **When** its history is opened,
   **Then** each listed day shows both meal slots with taken/missed state, and days
   outside its course don't appear.

---

### Edge Cases

- Expected doses for a past day must be computed against that day (course windows via
  `effStart`, `activeOn`-style), not against today's active list.
- Meds edited or deleted after the fact: ticks referencing a deleted med are ignored
  (not shown as phantom rows); editing a course's dates changes which days count as
  scheduled, and history follows the current definition (documented behaviour).
- Log is pruned to 60 days — history never claims to cover more, and the view states
  its window.
- A dose ticked and later unticked counts as not taken (only `on:true` entries count).
- Days with meds added mid-day: expected count is whatever is scheduled for that day
  at render time; no attempt to reconstruct intra-day timelines.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide a History view reachable from the existing
  navigation without adding a persistent fourth tab (candidate: from the setup view,
  like the travel calculator — final placement decided in the plan).
- **FR-002**: For each of the last N days (N = min(60, days with any data or schedule),
  at least 14), the view MUST show taken vs expected dose counts and a visual
  complete / partial / none / nothing-scheduled state.
- **FR-003**: Expected doses for a day MUST be derived from course windows active on
  that day (meals × active meds), reusing the same logic family as the travel
  calculator's `activeOn`.
- **FR-004**: Tapping a day MUST reveal its missed doses by med and meal (Story 1,
  scenario 2).
- **FR-005**: The view MUST compute and display the current streak per Story 2 rules.
- **FR-006**: Per-medication history (Story 3) MUST be reachable from the day detail
  and MUST scope itself to the med's course window.
- **FR-007**: The view MUST work fully offline from local data; sync merely refreshes
  it as elsewhere in the app.
- **FR-008**: Rendering the view MUST NOT mutate the log (read-only over `takenOn`
  and the log shape; no writes).

### Key Entities

- **Day summary**: date, expected dose keys (med|meal), taken dose keys, state.
- **Streak**: integer + the rule set in Story 2 (derived, never stored).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can answer "did I miss anything in the last week?" in one glance
  (≤1 interaction from the checklist).
- **SC-002**: Day states in a seeded 14-day scenario match hand-computed truth 100%.
- **SC-003**: Opening History causes zero writes to storage and zero sync pushes.
- **SC-004**: The view renders correctly in both themes and at 390px width.

## Assumptions

- The 60-day pruning window is an accepted bound on history depth.
- No export/print of history in this feature (possible follow-up).
- No new server or storage shape is needed; the existing `medlog:v4` log is the sole
  data source, so this feature is Constitution-clean (single file, offline-first).
- "Expected" for past days uses current med definitions (see Edge Cases) — accepted
  trade-off to avoid storing schedule snapshots.
