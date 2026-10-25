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
