# Game logos

Files here are named by **game id** (the `id` field in `src/data/games.js`) and
are picked up automatically — `GameTile` globs this directory at build time, so
adding a logo needs no code change and no manifest to regenerate.

```
src/assets/logos/valorant.svg   ->  used for the Valorant tile
src/assets/logos/mlbb.png       ->  used for the Mobile Legends tile
```

Accepted extensions: `.svg`, `.png`, `.webp`, `.jpg`. A title with no file here
falls back to its monogram tile, so partial coverage is fine.

## What ships in the repo

`npm run logos` vendors the marks that exist on [Simple Icons](https://simpleicons.org)
(icon files are CC0 1.0), which currently covers six titles: Valorant,
Counter-Strike 2, League of Legends, Dota 2, Fortnite and PUBG Mobile. Simple
Icons has no mark for the other nineteen, including every one of the mobile
MOBAs, so those need files supplied by hand.

## Before adding the rest

These marks are trademarks of their publishers. Using them to identify the games
a platform actually covers is normal nominative use — it is what every esports
aggregator does — but it is not a licence to restyle them, and press-kit terms
usually forbid recolouring, distorting or combining a mark with other logos.
Take assets from each publisher's official press kit and follow its rules.

Prefer SVG, and prefer a mark that reads at 28px: full lockups with a wordmark
turn to mush in the small tile. A square or badge form of the logo works best.
