# Quickstart: validating the Care Calendar

Seeded Playwright scenario against the mock server (extended to store
`care`/`care_updated`).

**Seed**: med M (10 days, started 4 days ago → last dose in 5 days);
visit V1 anchored to M with offset 2, tests T1 "3 days before", T2 "0 days
before"; visit V2 fixed on a past date (2 days ago), undone.

**Checks** (→ spec success criteria):

1. **Anchoring (SC-002)** — V1 date = courseEnd(M)+2; T1 = V1−3; T2 = V1.
   Extend M by 5 days via the app → all three shift by 5.
2. **Friday grid (FR-005)** — first column header is "Fr"; the 1st of the
   displayed month sits in the correct column; today highlighted; dots on
   V1/T1/T2/course-end days with correct kind colours; prev/next re-render.
3. **Agenda order + overdue (US3)** — V2 flagged overdue at top; remaining
   items in date order; course end of M appears, untickable.
4. **Done (FR-004)** — tick T1 → stays done after visit moves; tick V2 →
   leaves overdue set; unticking works.
5. **In-app notification (FR-010)** — with T2 due today (set M so V1 = today):
   checklist shows the banner naming T2; calendar icon has the dot; tapping
   the banner opens the calendar. With nothing due: no banner, no dot.
6. **Editor (SC-003)** — create a visit with two tests through `#vsheet` in ≤6
   interactions from the calendar; edit and delete flows work; deleting a
   visit removes its tests; deleting the anchor med freezes the visit's date.
7. **Sync (SC-005)** — device A creates V1+tests, ticks T1; device B joins by
   code → sees them incl. done mark; B unticks T1 → A sees it after pull.
   A POST without `care` (simulated old client) does not wipe B's care data.
8. **Themes/layout (SC-004)** — light + dark screenshots at 390px; grid never
   overflows horizontally.

**Expected**: every check prints PASS, zero page errors; sync + history
regression suites still pass.
