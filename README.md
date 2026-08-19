# Doses — medication tracker

Meal-anchored medication checklist: breakfast / lunch / dinner instead of clock times,
with course durations, dependencies between courses, and a travel packing calculator.
Static site, no build, no server. All data stays on the device.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app |
| `manifest.webmanifest` | Installability, name, icons |
| `sw.js` | Offline cache |
| `icon-*.png` | 180 for iOS, 192/512 for Android |
| `vercel.json` | Stops the page and worker being cached stale |
| `CLAUDE.md` | Notes for working on the code |

## Deploy

**Vercel** — import the repo, framework preset "Other", no build command, output directory `./`.

**GitHub Pages** — Settings → Pages → deploy from `main`, folder `/ (root)`.

Either way the files must sit at the repository root.

## Install on iPhone

Open the deployed URL in **Safari** → Share → **Add to Home Screen**, then launch from the icon.

This step matters. Safari clears local storage after seven days without interaction, but apps
added to the Home Screen keep their own usage counter and are exempt — so the medication list
survives. Opening the URL as a normal tab, or the file locally, does not give you that.

## Data

Lives in the browser storage of that one install. Deleting the icon or clearing site data
removes the medication list and the tick history.
