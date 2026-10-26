# Lounge Finder

An iPhone home-screen web app that shows which airport lounges you can get into, based on your saved credit cards, lounge memberships, airline status and the flight you're taking.

## How it's put together

- `index.html`: the whole app. Your profile is saved only on your iPhone.
- `rules.json`: lounge rules and locations. The app reads this file from this GitHub repo each time it opens, so rule updates show up right away.
- `sw.js`: lets the app open without signal, using the last rules it loaded.
- `manifest.webmanifest` and `icons/`: the home-screen name and icon.
- `netlify.toml`: settings for Netlify, if you ever host it there. The app is hosted on GitHub Pages: https://movebeyondfptp.github.io/lounge-finder/

## How rules stay current

A monthly scheduled Claude task researches current lounge access rules from official airline, card and lounge sources. It then commits an updated `rules.json` here. Every network in the file lists the date it was checked and the sources used.

## Editing rules by hand

Edit `rules.json` on GitHub and commit. The app picks up the change the next time it opens, after up to about 5 minutes of GitHub caching.

## Daily watcher (free)

`.github/workflows/watch.yml` runs `watcher/watch.py` every day on GitHub Actions, which is free for public repos. It downloads each page in `watcher/sources.json` and keeps only the lines about lounge access, then compares them with yesterday's copy in `watcher/snapshots/`. Any difference is written to `watcher/changes.json`. Pages it can't read are marked in `watcher/state.json`.

A weekly Claude check reads `changes.json`. If nothing changed, it stops right away. Otherwise it researches only the networks whose pages changed, updates `rules.json`, and clears the notes. Once a month it also does a full check, which covers any page the watcher couldn't read.

To run the watcher by hand, open the repo's **Actions** tab, choose **Watch lounge rule sources**, then **Run workflow**.

## Nightly airport-website scan (free)

`.github/workflows/airports.yml` runs `watcher/airports.py` every night. It covers US airports outside the main directory, finding each airport's website in `watcher/airport_sites.json` (from OurAirports, with gaps filled from Wikidata). It visits the home page and a few likely pages (amenities, shop & dine, lounges) and looks for known lounge names: Delta Sky Club, United Club, Admirals Club, Alaska Lounge, Centurion, Escape, Plaza Premium and Maple Leaf. Finds are added to `rules.json` labeled as found on the airport's website, and flagged for the weekly Claude review. A lounge that stops appearing for 3 scans in a row is removed. Results are in `watcher/airport_scan.json`.
