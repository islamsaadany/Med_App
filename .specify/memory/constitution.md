# Doses Constitution

## Core Principles

### I. One File Is the Point
The entire front-end lives in `index.html` — markup, styles, logic, in that order.
No build step, no bundler, no framework, no client-side dependency. A feature that
cannot be expressed this way must justify itself in its plan's Complexity Tracking
section before any code is written. Server code is allowed only as small, single-purpose
Vercel functions under `api/`, and only when a capability is impossible client-side
(today that is exactly one: cross-device sync).

### II. Meals, Not Clocks
The user's mental model is breakfast / lunch / dinner with a relation (before / with /
after) and a gap — never wall-clock times. Every feature must speak this language.
Scheduling logic goes through `effStart()` (dependency chains) and the existing date
helpers; nothing reads `m.start` directly.

### III. Offline-First, Device-Primary
The device copy is the working truth. The app must be fully usable with no network,
no database, and no sync code. The server is a meeting point, never a gatekeeper:
meds merge by last-write-wins on the list timestamp, the tick log merges per entry by
timestamp (unticks are records too). Any new synced data must define its merge rule
in the spec before implementation.

### IV. Calm UI, No Lost State
Ticking a dose never re-renders the list — patch the card, update the counters
(`toggle()` + `updateCounts()`); scroll position and animations are user state.
All colours come from the palette variables (`:root` light, `html.dark` dark) with
tints via `color-mix`; a hard-coded colour outside the palette blocks merge. Light
is the default theme.

### V. Verified in a Real Browser
Every user-visible change is exercised in a real (headless) browser before commit:
render, interact, screenshot, and check for page errors. Sync changes are tested with
two isolated browser contexts against a mock of `api/sync.js` covering propagation in
both directions. A repo-level breaking change to a storage shape requires a version
bump of that key plus a migration path, and a `sw.js` VERSION bump accompanies any
deploy-critical change.

## Constraints

- Target platform: iPhone Safari as an installed PWA first; desktop browsers second.
- Storage: `store` wrapper only (artifact host → localStorage → memory); never assume
  `localStorage` exists.
- The service worker never caches `/api/`.
- Data sensitivity: this is one person's real prescription. No analytics, no third-party
  requests beyond Google Fonts, no accounts; the sync code is the only credential and
  is generated with ≥60 bits of entropy.
- English UI text, but data values (names, courses) are frequently Arabic — everything
  must render RTL text correctly inside LTR layout.

## Development Workflow

- Features follow spec-kit: `/speckit-specify` → user reviews the spec → `/speckit-plan`
  → `/speckit-tasks` → `/speckit-implement`. Small fixes (a bug with an obvious correct
  behaviour) may skip the ceremony but never skip browser verification.
- **Mockup gate (NON-NEGOTIABLE)**: any user-visible feature or UI change gets a visual
  mockup shown to the user, and implementation/merge waits for their explicit approval.
  Answering design questions is input to the mockup, not approval to build. Nothing
  merges to main without the user having seen and approved what it looks like.
- All work lands on the designated feature branch; commits are per-feature with
  descriptive messages.
- `CLAUDE.md` is the living map of the code and must be updated in the same commit as
  any change that invalidates it.

## Governance

This constitution supersedes ad-hoc practice. Amendments are commits that edit this
file with a rationale in the commit message and a version bump below. Every plan's
Constitution Check gates on the principles above; violations must be listed and
justified in Complexity Tracking or the plan is rejected.

**Version**: 1.1.0 | **Ratified**: 2026-08-19 | **Last Amended**: 2026-08-19 (mockup gate added after it was violated for 002-care-calendar)
