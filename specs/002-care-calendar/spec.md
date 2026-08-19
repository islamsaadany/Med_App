# Feature Specification: Care Calendar

**Feature Branch**: `002-care-calendar`

**Created**: 2026-08-19

**Status**: Built on the feature branch — awaiting user approval of the mockup before merge

**Input**: User description: "Care calendar: doctor visits/checkups and lab tests. A visit can be set on a fixed date OR anchored to a medication course finishing (e.g. 'when Trigastrocare ends' or 'N days after it ends'). Lab tests/analyses attach to a visit and are allocated relative to the visit date (e.g. '3 days before the visit'). A calendar view shows when to do what — upcoming visits, tests, and medication course ends — and items can be marked done. Synced across devices like the med list."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Plan a checkup around a course ending (Priority: P1)

The user adds a doctor visit ("Dr. Ahmed — GI follow-up") and anchors it to a
medication course: on the day the course ends, or N days after. If the course
dates move (its own start changes, or a dependency shifts it), the visit moves
with it — same behaviour the user already knows from meds that start after
another finishes. A visit can also simply have a fixed date.

**Why this priority**: This is the core request — checkups timed to treatment,
not to arbitrary dates — and everything else (tests, calendar) hangs off visits.

**Independent Test**: Create a visit anchored "3 days after Trigastrocare ends";
change Trigastrocare's duration; the visit's computed date shifts accordingly.

**Acceptance Scenarios**:

1. **Given** Trigastrocare ends on the 20th, **When** the user adds a visit
   anchored "when it ends + 3 days", **Then** the visit shows on the 23rd.
2. **Given** that visit, **When** Trigastrocare is extended by 5 days,
   **Then** the visit moves to the 28th without the user touching it.
3. **Given** a visit with a fixed date, **When** meds change, **Then** the
   visit stays put.
4. **Given** a visit anchored to a med that is later deleted, **Then** the visit
   keeps the last computed date as a fixed date (same rule as med dependencies).

---

### User Story 2 - Tests to do before the visit (Priority: P1)

The user attaches lab tests/analyses to a visit ("H. pylori stool antigen",
"CBC") each with an offset: N days before the visit (0 = same day). Each test's
date is computed from the visit's date, so if the visit moves, the tests move
with it. Tests can be marked done; the visit itself can be marked done too.

**Why this priority**: Inseparable from Story 1 in the user's description —
"add the type of analysis to do before going, allocated based on the visit day".

**Independent Test**: Attach a test "3 days before" a visit on the 23rd → test
shows on the 20th; move the visit → test follows; tick the test → shows done.

**Acceptance Scenarios**:

1. **Given** a visit on the 23rd with a test at "3 days before", **Then** the
   test appears on the 20th.
2. **Given** the visit moves to the 28th, **Then** the test moves to the 25th.
3. **Given** a test marked done, **When** the visit moves, **Then** the test
   stays done (done is a fact about the test, not the date).
4. **Given** a visit marked done, **Then** it and its tests stop appearing as
   upcoming (kept in the list, shown as done).

---

### User Story 3 - The calendar: see when to do what (Priority: P2)

A calendar view (opened from the app's navigation) shows a month grid with
marks on days that have items, plus an agenda list of upcoming items in date
order: lab tests, doctor visits, and medication course endings (derived from
the med list — "Lanex finishes"). Tapping a day highlights its items; tapping
an item in the agenda opens it for editing or marks it done. Course endings
are informational (not tickable).

**Why this priority**: The visualization layer over Stories 1–2; valuable but
buildable only once visits/tests exist.

**Independent Test**: Seed meds + visits + tests; the month grid marks exactly
the right days; the agenda lists items in date order with correct labels.

**Acceptance Scenarios**:

1. **Given** a visit on the 23rd, a test on the 20th, and a course ending on
   the 18th, **Then** all three days carry marks in the month grid and appear
   in the agenda in order 18 → 20 → 23.
2. **Given** the month is changed (prev/next), **Then** the grid re-marks for
   that month; the agenda always shows the next upcoming items regardless of
   the displayed month.
3. **Given** an overdue undone item (date in the past), **Then** it appears at
   the top of the agenda flagged as overdue, not silently dropped.

---

### Edge Cases

- Anchor chains: a visit anchored to a med whose start depends on another med
  resolves through the same chain (`effStart` + days); cycles are impossible
  since visits can't be anchors.
- A visit anchored to an ongoing med (no `days`) is invalid — anchoring is only
  offered for meds with an end date (same rule as the existing "starts after"
  dropdown).
- Deleting a visit deletes its attached tests (they have no independent life).
- A test whose computed date lands in the past (visit soon, offset large) shows
  immediately as overdue-if-undone.
- Month grid must handle months starting any weekday and 28–31 days; week
  starts Friday (Fr Sa Su Mo Tu We Th).
- Done items older than 60 days may be pruned like the tick log (calendar is
  forward-looking; history view remains the record of meds).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create, edit, and delete doctor visits with
  a title, optional note, and a date that is either fixed or anchored to a
  medication course end plus an offset in days (0–30).
- **FR-002**: Anchored visit dates MUST be derived at render time from the
  course window (via the existing `effStart`-family logic), so course changes
  move the visit automatically.
- **FR-003**: Users MUST be able to attach lab tests to a visit, each with a
  name and an offset in days before the visit (0–30); test dates derive from
  the visit's current date.
- **FR-004**: Visits and tests MUST be markable done/undone; done state
  survives date recomputation.
- **FR-005**: A calendar view MUST show a month grid (week starts Friday,
  prev/next navigation, today highlighted) with per-day marks colour-coded by kind
  (visit / test / course end), and an agenda of upcoming items in date order
  with overdue undone items flagged at top.
- **FR-006**: Medication course endings MUST appear in the calendar derived
  from the med list (meds with `days`), with no stored state and no tick.
- **FR-007**: Visits and tests MUST sync across devices with the same
  offline-first semantics as meds: one list, last-write-wins on a list
  timestamp; done marks travel inside the items. (Merge rule per constitution
  III: whole-list LWW — a simultaneous edit on two devices keeps the newer
  list; acceptable for one person's data, consistent with meds.)
- **FR-008**: The calendar MUST work fully offline from local data; without a
  database the feature still works on-device, like everything else.
- **FR-009**: Entry point MUST NOT add a persistent tab to the checklist; the
  calendar opens from the header (a fourth small icon) and from a button in the
  setup view, following the app's existing navigation pattern.
- **FR-010**: In-app notifications: when any visit or test is due today or
  overdue and not done, the checklist MUST show a slim tappable banner naming
  the item (or a count when several), and the header calendar icon MUST carry
  a small dot; tapping either opens the calendar. No system/push notifications.

### Key Entities

- **Visit**: id, title, note, anchor (fixed date | {medId, offsetDays}),
  done:bool, tests: [Test].
- **Test**: id, name, daysBefore, done:bool — exists only inside a Visit.
- **CalendarItem** (derived at render): date, kind (visit|test|medEnd), label,
  done, overdue — never stored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The user can answer "what do I need to do before my next doctor
  visit, and when?" from one screen.
- **SC-002**: In a seeded scenario, anchored visit and test dates match
  hand-computed truth 100%, including after a course-length change.
- **SC-003**: Creating a visit with two tests takes ≤6 interactions from the
  calendar view.
- **SC-004**: The calendar renders correctly in both themes at 390px width;
  the month grid never scrolls horizontally.
- **SC-005**: With sync on, a visit added on one device appears on another
  after its next pull, including done marks.

## Assumptions

- One person's data; no multi-user calendars or invitations.
- Notifications are in-app only (banner + icon dot, FR-010); no system/push
  notifications, consistent with the project's standing decision.
- Times of day are out of scope — the calendar is day-granular, matching the
  app's "no clock times" principle.
- Recurring visits (e.g. every 3 months) are out of scope for v1; a follow-up
  can add them.
- New storage key (`care:v1`) with its own LWW timestamp, synced inside the
  existing per-code row (one new column, added backwards-compatibly on first
  use); old clients that don't send care data must never wipe another
  device's care data.
