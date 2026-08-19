# Doses — medication tracker

Meal-anchored medication checklist: breakfast / lunch / dinner instead of clock times,
with course durations, dependencies between courses, and a travel packing calculator.
Static front-end, no build step. Data lives on the device, with optional sync
across devices through a small serverless function and a Neon Postgres database.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole front-end |
| `api/sync.js` | Vercel function backing the cross-device sync |
| `package.json` | Dependency of the sync function (`@neondatabase/serverless`) |
| `manifest.webmanifest` | Installability, name, icons |
| `sw.js` | Offline cache |
| `icon-*.png` | 180 for iOS, 192/512 for Android |
| `vercel.json` | Stops the page and worker being cached stale |
| `CLAUDE.md` | Notes for working on the code |

## Deploy

**Vercel** — import the repo, framework preset "Other", no build command, output directory `./`.
For sync, add the **Neon** integration (Storage tab → Create database → Neon); it injects
`DATABASE_URL` into the deployment, and `api/sync.js` creates its one table on first use.
Without a database the app still works — the sync section just reports that no database is linked.

**GitHub Pages** — Settings → Pages → deploy from `main`, folder `/ (root)`. The app works
fully offline-local this way, but sync needs the Vercel function, so the sync section will
show "can't reach the server".

## Sync

Off by default. In the setup view, one device turns sync on and gets a private code
(e.g. `doses-x7k2mp-9fw3qh`); other devices enter that code and share the list and the
tick history from then on. The code is the only credential — anyone who has it can read
and write that list, so treat it like a password. Meds resolve conflicts by
last-write-wins; ticks and unticks merge per entry by timestamp.

## Install on iPhone

Open the deployed URL in **Safari** → Share → **Add to Home Screen**, then launch from the icon.

This step matters. Safari clears local storage after seven days without interaction, but apps
added to the Home Screen keep their own usage counter and are exempt — so the medication list
survives. Opening the URL as a normal tab, or the file locally, does not give you that.

## Data

Lives in the browser storage of that install. Deleting the icon or clearing site data
removes the local copy; if sync is on, the list survives on the server and comes back
by entering the same code again.
