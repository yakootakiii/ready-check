# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm install
npm run dev            # Vite dev server
npm run build          # production build into dist/
npm run preview        # serve the built output
npm run smoke          # SSR-render every route and fail on errors
npm run logos          # vendor game logos (see "Game logos"); --force re-downloads
```

**The build is not a safety net.** Vite does no type or reference checking, so a
`ReferenceError` from a deleted constant builds green and crashes in the
browser. `npm run smoke` closes most of that gap — it renders all 23 routes
through Vite's SSR pipeline and also fails on `undefined`, `NaN`, a stray
`$`-denominated prize or leftover "Ready Check" naming in the output.

It does **not** close all of it: effects and event handlers never run during
`renderToString`. A handler calling an undefined binding passes the smoke test
and throws on click — that exact bug shipped once, when a page was renamed and
its component name was not. Load the app and click through what you changed.

## What this is

**Outplay** — a look-and-feel mockup of an AI-powered competitive intelligence
platform for esports players and teams, specced in `outplay-product-brief.md`.
No backend, no fetching, no auth; all data is generated or fixtured.

It is the successor to "Ready Check", which was a readiness-and-tournament hub.
The ecosystem layer survived that rework almost intact — the same 25 titles, the
same generated ladders, teams, schools and brackets — but the product around it
is different, and the difference is the point:

> The central question is **"what can we learn from how you compete?"**, and the
> value proposition is turning that understanding into an edge in the next
> matchup.

Tournaments, ladders and scrims are the substrate, not the product. **If a panel
cannot answer that central question, it belongs below the ones that can** — that
is the rule that decides ordering on every screen.

**The setting is the Philippines.** Regions are PH regions (NCR, CALABARZON,
Cebu, Davao, Iloilo, Pampanga, Bicol, Baguio, Bacolod, Cagayan de Oro,
Zamboanga, Central Luzon, Laguna, Cavite), venues are PH cities, prize pools are
in pesos via `formatPrize`, and team names, player handles, schools and
organizations are Filipino. Anything new must match — a stray "NA-East" or a
dollar sign is a bug.

Stack: React 19 + Vite + Tailwind v4 (`@tailwindcss/vite`), React Router 7,
plain JSX (no TypeScript).

## The core loop, and why the nav is ordered the way it is

    PLAY -> ANALYZE -> UNDERSTAND -> ADAPT -> OUTPLAY

Analyze (what happened, and what it says about you) precedes Matchup (what that
means against who is next), which precedes Compete (going and doing it). Network
and Passport are the ecosystem either side of the loop. `src/nav.js` is that
ordering, and it is not arbitrary — reordering the rail changes the argument the
product makes about itself.

## Pages

| Route | File | What it is |
|---|---|---|
| `/` | `pages/Home.jsx` | Hero, then the four panels (your DNA, next match, your edge, watch out), recent insights, performance evolution, the ecosystem, and the pipeline diagram. |
| `/analyze` | `pages/Analyze.jsx` | Competitive DNA in full: 12-axis radar, identity, every dimension, style interaction. Tabs between team DNA and the player's own. |
| `/analyze/matches` | `pages/MatchAnalysis.jsx` | Post-match intelligence: prediction against reality per observation, the tendency learned, what moved in your profile. |
| `/analyze/trends` | `pages/Performance.jsx` | Evolution: one large chart plus twelve small multiples, then/now radar, attribution to matches. |
| `/analyze/vod` | `pages/VodIntel.jsx` | VOD review where the model's markers and the player's are visibly different, and each model marker names the dimension it is evidence for. |
| `/analyze/condition` | `pages/Condition.jsx` | Sleep/load/stress as **inputs that explain variance**. The quietest screen in the app, on purpose. |
| `/matchup` | `pages/Matchup.jsx` | The flagship. Matchup insight, concern and edge, two shapes on one grid, all twelve dimensions, prep focus, and a deliberately small projection. |
| `/matchup/opponents` | `pages/Opponents.jsx` | Scouting list, ordered by how awkward each side is for you rather than by rating. |
| `/matchup/opponents/:teamId` | ″ | One opponent: their shape against yours, tactical tendencies, head-to-head, roster. |
| `/compete/matches` | `pages/MatchCentre.jsx` | Live viewer or next fixture, plus the pre-match brief, setup check and comms. |
| `/compete/tournaments` | `pages/Tournaments.jsx` | Title picker → a title's circuit → one event's draw, with your route through it and whether the model called each round. |
| `/compete/scrims` | `pages/Scrims.jsx` | Scrim finder ordered by **style match to your next opponent**, not by rank. |
| `/compete/setup` | `pages/SetupCheck.jsx` | Platform-aware hardware and connection checks. |
| `/network` | `pages/NetworkPlayers.jsx` | Players, listed with their competitive identity and trajectory beside the rating. |
| `/network/teams` | `pages/NetworkTeams.jsx` | Every team; `/network/teams/:teamId` is the team page. |
| `/network/schools` | `pages/NetworkBackers.jsx` | Schools with an active roster; `/network/orgs` is the same screen with `kind="company"`. |
| `/network/talent` | `pages/Talent.jsx` | Talent intelligence: roster gaps, candidates ranked by fit, emerging talent, and the same model run in reverse. |
| `/passport` | `pages/Passport.jsx` | The player's own passport; `/passport/:playerId` renders anyone found through the Network, assembled from the graph — their team's record, form, roster, placements and fixtures — rather than padded out with invented fields. |

`Tournaments.jsx` holds all three levels and branches on `useParams()`.
`NetworkBackers.jsx` serves schools and companies from one `KINDS` map.
`Opponents.jsx` and `Passport.jsx` each hold a list view and a detail view.

## The intelligence layer

This is the part that is genuinely new, and the part most likely to be misused.

### `src/data/dna.js` — Competitive DNA

The model of *how* someone competes. Three rules hold it together:

- **A DNA is a profile, never a score.** Nothing reduces to one number and no
  screen may present it as one. The dimensions are read together, as a shape.
- **It is derived, not decorated.** A player's DNA follows from their rating,
  their role and their genre; a team's from its record and its form. Two screens
  showing the same competitor show the same shape.
- **It is deterministic** — seeded from the entity id and memoised.

Twelve player dimensions and twelve team ones, six of each marked `core` for
compact surfaces. Key exports: `playerDna`, `teamDna`, `dimensionsFor`,
`coreDimensionsFor`, `orderedDimensions`, `identityFor`, `traitsFor`,
`dnaHistory`, `deltasFrom`, `roleArchetype`.

Four things to know before touching it:

- **`shape()` compresses the tails; `clamp()` does not.** Fresh values go
  through `shape`, because strong competitors generate raw numbers past the
  ceiling and hard clipping pinned about 5% of all dimensions — and four of the
  top team's twelve — at the same 97, which is where a scouting read needs the
  most resolution. `dnaHistory` walks backwards through values that are already
  shaped and uses the plain `clamp`: compressing them again at every step would
  drag the whole history toward the soft band and invent a downward trend.
  Note that levels are deliberately close (about 11 points of mean separates the
  strongest team in a scene from the weakest). **That is correct.** A wide level
  gap would make radar *area* read as quality, and a DNA is a profile, not a
  score — the competitors are meant to differ in shape.

- **`INVERTED_DIMENSIONS`.** Role reliance is the one dimension where high is
  worse. Anything that ranks, colours or compares dimensions must go through
  `orderedDimensions` or `advantageOf` rather than subtracting raw values, or a
  team's biggest fragility gets reported as an advantage.
- **Roles are matched by keyword, not by table.** `ROLE_ARCHETYPES` maps 25
  titles' role vocabularies onto five competitive archetypes by keyword, first
  match wins. A Duelist, an Entry, a Rusher and a Gold laner all play forward for
  a living, and the model says so without knowing which game it is looking at.
- **`GENRE_BIAS` is what stops every scene reading the same.** Fighting-game
  players live on mechanics and nerve; battle-royale rosters live on positioning.
  Without the bias table, all 25 scenes produce the same silhouette — which is
  the exact failure this model exists to avoid.

Identity strings are **composed**, not picked from a list: top dimension supplies
the noun, second supplies the adjective. That is what keeps "Adaptive Aggressor"
specific rather than generic.

### `src/data/matchup.js` — Matchup Intelligence

Two DNA profiles in; edges, concerns, expected tempo, prep focus and a projection
out. There is no separate "matchup data" anywhere — the whole claim of the
product is that the matchup falls out of the two models.

- `myTeam(gameId)` is **third in the table on purpose** (`MY_TEAM_INDEX = 2`).
  The top seed would make every matchup favourable and every insight
  congratulatory, which teaches the reader nothing.
- **A gap under six points is `even`.** That is inside the model's noise, and a
  recommendation on top of a rounding error is how an analytics product loses a
  coach's trust.
- `debriefFor` is the return half of the loop. Observations grade as `confirmed`
  / `shifted` / `surprise`, and accuracy weights them 1 / 0.5 / 0 — scoring
  `shifted` as a hit would let the model report a perfect week in which it
  mis-sized every call.
- Discoveries are always **conditional** ("their aggression is conditional on
  objective control"), because that is what one match actually reveals.
- `sparringLikeness` is what makes the scrim finder more than a board: it ranks
  offers by how closely a side's DNA resembles your next opponent's.
- `bracketPathFor` runs the model forwards over a whole draw rather than one
  fixture, which is what turns a bracket from a results table into a plan. It
  returns `null` for solo titles, whose draws come from the player pool and
  contain no roster to have a team profile.
- `headToHeadFor` is the history between two specific sides. Meetings already
  inside the recent window are **reused, not regenerated**, so this and match
  analysis cannot disagree about the same game. Each older meeting draws its
  projection *first* and derives the result from it, so a tie the model called
  at 62% really was won about 62% of the time — generating the result from the
  current projection and printing a jittered one beside it would show a call
  that number never made. The oldest meeting predates model coverage and says
  so, for the same reason coverage is stated everywhere else.

All three accuracy readouts — recent matches, bracket paths and head-to-head —
land at 60–64% across the whole dataset. They are computed independently, so if
one of them drifts far from the others, something has decoupled.

### `src/data/talent.js` — Talent Intelligence

`rosterGapsFor` reads a team's own profile and names what it is missing;
`fitFor` scores a player against those gaps rather than against the ladder.
`NEED_SOURCES` is the bridge between the player and team vocabularies, and it is
written down and explained because a recruitment claim is only as good as that
mapping. `candidatesFor` deliberately does **not** sort by rating.

### `src/data/intel.js` — the stack, and the feed

`PIPELINE` is the architecture the product claims: data → features → engine →
DNA → matchup → insights. The ordering is the argument, and the diagram is
weighted to match (inputs quiet, engine heavy, outputs at the bottom).
**Language models are the explanation layer at the end of that stack, never the
source.** A version of this diagram with a chat box at the top describes a
different, weaker product.

`insightFeedFor` assembles from the same debriefs, matchups and DNA movements the
detail screens render, so a feed row and the screen it links to can never tell
different stories.

### Coverage is honest

`INTEL_COVERAGE` in `games.js` grades every title `full` / `beta` / `planned`.
One title (Valorant) is modelled properly, four are calibrating, the rest are
ecosystem-only. `<CoverageNote>` goes on every screen whose content depends on
the model, and `confidenceFor` caps confidence by coverage level. A platform
showing the same confident profile for all 25 titles would be lying about the
thing it is selling.

## Architecture

### Shell

- `src/App.jsx` — `TopBar` + `Sidebar` + routed `<main>` + `MobileTabBar`, with
  `GameProvider` and `LiveMatchProvider` above the router.
  **`main` is the scroll container, not the window.** The shell is a `h-dvh`
  column so the top bar and rail stay pinned without sticky offsets that would
  break when the live-match strip changes the bar's height. Consequences:
  `window.scrollTo` does nothing (scroll `main`), and `App.jsx` resets
  `main.scrollTop` on route change because browser scroll restoration no longer
  applies.
- `src/nav.js` — the single source for the desktop rail (`NAV_GROUPS`) and the
  mobile bottom bar (`MOBILE_TABS`). Adding a page means a route in `App.jsx`, an
  entry here, and a line in `scripts/smoke.mjs`.
- `src/components/TopBar.jsx` — wordmark, module links, `GameSwitcher`, and the
  live-match strip (full-width from `md` up, a pill below it).
- `src/components/GameSwitcher.jsx` — the title picker, in the top bar because
  the selected title scopes every module.
- `src/components/PolyBackdrop.jsx` — the app-wide animated backdrop, rendered
  once behind every route, `fixed -z-10` and pointer-inert.
  **No ancestor may have an opaque background** — one paints over it, which is
  why `App.jsx` has no `bg-base` and `body` carries it instead. Every position
  comes from a seeded PRNG so the field never reshuffles.

### Context

- `src/gameContext.jsx` — the selected title. `useGame()` →
  `{ gameId, game, isAll, setGameId }`.
  **Intelligence is per-title.** `'all'` is meaningful for ecosystem screens, but
  every intelligence screen resolves it to `player.primaryGameId` rather than
  averaging 25 scenes into something meaningless. The idiom is
  `const active = game ?? GAMES_BY_ID[player.primaryGameId]`.
- `src/live.jsx` — live-match state, above the router because the top bar is the
  one place a live match persists across modules.

### Intelligence components

- `src/components/DnaRadar.jsx` — the signature visual. A radar is right here
  because the thing being read is the **silhouette**, and two overlaid outlines
  compare at a glance. Rules: it **never appears alone** (the numbered dimension
  list beside it carries the values and the accessibility), and **two series
  maximum** — three outlines on one polar grid is spaghetti. `pathLength={1000}`
  normalises the outline so one CSS dash length traces every size.
- `src/components/DnaDimensions.jsx` — the numbered read (`DnaDimensions`), the
  compact strip (`DnaStrip`), and `DeltaChip`, which goes neutral below the
  model's noise floor.
- `src/components/MatchupBars.jsx` — bars growing outward from a shared centre
  line, because the quantity being read is the **gap**. Direction is never left
  to subtraction: `advantage` arrives already signed from the matchup model.
  The row **reorders** below `sm` (label and gap onto their own line, via a
  wrapper that becomes `display: contents` at `sm`) rather than hiding the
  label. It hid it once, and twelve rows of two numbers and a bar with no
  dimension name attached is unreadable — on the flagship screen.
- `src/components/InsightCard.jsx` — one thing the system worked out. Tone is the
  classification, not decoration. Every insight carries its source.
- `src/components/CompetitiveIdentity.jsx` — identity, traits, and
  `ConfidenceMeter`. An identity asserted without a sample size is a horoscope.
- `src/components/IntelligencePipeline.jsx` — the stack diagram.
- `src/components/CoverageNote.jsx` — `CoverageBadge` and the full note. The
  badge is also on every row of the `GameSwitcher`: the picker is the one place
  a reader *chooses* the scope, and finding out on the next screen that the
  title you just selected has no behavioural model is the surprise the grading
  exists to prevent.
- `src/components/HeadToHead.jsx` — prior meetings, with the drift line as the
  point rather than a footnote. A raw head-to-head record is the most
  confidently misread number in sport; three wins over a side that has since
  rebuilt its tempo says very little, and this is the one surface that can say
  so.

### Other components

- `src/components/hud.jsx` — **the primitive set every screen is built from**:
  `HudPanel`, `HudPageHeader`, `HudSection`, `HudLabel`, `LivePip`, `Ticker`,
  `Countdown`, `Gauge`, `StatBar`, `FormRow`, `AnimatedNumber`.
- `src/components/ui.jsx` — `Button` and `EmptyState`.
- `src/components/AngularPanel.jsx` — the only home of the `angular-cut`
  clip-path. Never put that class on an element directly.
- `src/components/PlayerCard.jsx` — the passport card, used by `/passport` and by
  Talent. **Identity leads; rank is one chip among the supporting numbers.** That
  ordering is the whole difference from the old "my card". Unknown fields are
  dropped rather than rendered as a dash (`extraStats` fills the gap with
  something the platform does know), because a blank tile claims a field exists
  and is empty rather than that it was never collected.
- `src/components/NetworkTabs.jsx` — Players / Teams / Schools / Organizations /
  Talent, shared by every screen under `/network`.
- Also: `GameTile`, `LiveViewer`, `Reveal`, `Sidebar`, `MobileTabBar`,
  `RankBadge`, `Sparkline`, `VodTimeline`, `DiagnosticChecklist`, `icons.jsx`.

`NetworkTeams.jsx` also exports `BackerBadge`, `AccoladeRow` and `placementTone`,
reused by `NetworkBackers.jsx` and `Passport.jsx`.

### Support

- `src/hooks.js` — `useCountUp`, `useTickingClock`, `useCarousel`,
  `prefersReducedMotion`.
- `src/tiers.js` — the rank-tier ramp. Tailwind cannot see dynamically composed
  class names, so tier classes are written out in full.
- `src/format.js` — `formatClock` and `formatPrize` (peso pools).
- `src/index.css` — every design token in a Tailwind v4 `@theme` block, plus
  `angular-cut`, `hud-label`, `hud-corners`, `sheen`, `scanlines`, `plot-grid`,
  `spin-ring`, the trace/fade animations and all keyframes.
  **Never hardcode a hex outside this file.**

## Data layer

- `src/data/games.js` — 25 titles (12 PC, 9 mobile, 4 console), `GENRES`,
  `INTEL_COVERAGE` / `COVERAGE` / `coverageOf`, and `GENRE_LEXICON` — the nouns
  an insight uses, keyed by genre so "objective control" means towers in a MOBA
  and site control in a shooter, from seven entries rather than twenty-five.
- `src/data/generate.js` — **the only source of scene-shaped data.** `teamsFor`,
  `playersFor`, `liveMatchesFor`, `openScrimsFor`, `eventsFor`, `bracketFor`,
  `activityFor`, `circuitSummaryFor`, `findPlayer`, and `acrossGames` for the
  all-titles view. **`bracketFor` weights its results by entrant strength**, not
  by a coin flip — a draw whose winners ignore the standings contradicts both
  the table and the matchup model that reads off it, and the path panel then
  reports the model missing almost every round. Across all 72 draws the model
  now calls about 64%, in line with `modelAccuracyFor`. Everything derives deterministically
  from a seed built out of the game id and is memoised. **Seeds must stay
  stable** — a leaderboard that reshuffles between renders reads as broken.
- `src/data/mock.js` — the signed-in player, their per-title profiles, verified
  achievements, team history, condition signals and VOD fixtures.
  `playerEntityFor(gameId)` shapes the signed-in player for `playerDna`, so they
  go through the same model as every ladder row rather than getting a special
  case.
- `src/data/checks.js` — `diagnosticsFor(platform)`, `networkMetricsFor`.
- `src/data/league.js` — the Network module's layer **on top of** `generate.js`:
  backers, accolades, rosters. Two rules hold it together — a backer only takes
  teams in a region it operates in, and rosters start from ladder players so a
  team's stars are the same people the leaderboards show.

## Game-agnostic by construction

25 titles across PC, mobile and console — not one game with the others bolted on.

- **Nothing hardcodes a title.** Every title carries its own `roles`, `stats`,
  `unit`, `teamSize`, `regions` and `platform`.
- **Read stat labels from the game, never from a fixed list.** A leaderboard
  renders `player.stats`; it does not render "ACS" and "K/D".
- **Insight language comes from `GENRE_LEXICON`,** never from one game's nouns.
- **`platform` drives real behaviour** — the setup check swaps frame rate and
  peripherals for battery, thermals and touch sampling on mobile.
- **Rows carry `gameId`, and the all-titles view shows it** via a `GameTile`.
- **Genre drives the tile colour.** Extend `GENRES` rather than inventing
  per-game colours.
- **Names are Filipino but invented.** Only the game titles and logos are real.
  Every team, player, school, organization and event is fabricated — attaching a
  fabricated championship to a real university would misrepresent it. "Sibol"
  was removed from the circuit pool for exactly this reason.
- **Watch for accidental uniformity across titles.** Several bugs of this shape
  have shipped and been fixed. When you aggregate or sort across games, check the
  top of the result for clones — and when you touch `dna.js`, check that two
  competitors of the same rating and role do not share a silhouette.

To add a title: append an entry to `GAMES`, and grade it in `INTEL_COVERAGE` if
the model actually covers it.

## Design invariants

These make the mockup read as a competitive intelligence product rather than a
dark-themed SaaS dashboard. Violating them is the likeliest way to get the
design wrong while the code still "works".

- **Colour is meaning, and the meaning is fixed.** `signal` is you and the
  intelligence layer, `ember` is the opponent / live / a warning, `edge` is an
  advantage. A matchup screen is readable before a word of it is: blue is your
  shape, orange is theirs, green is where you are ahead. Do not reuse these for
  decoration.
- **Never lead with a single number.** No screen may reduce a Competitive DNA to
  a score, and the matchup projection is small, low on the page, and always
  carries its uncertainty band. A matchup screen whose largest element is a win
  percentage has become a betting site.
- **Rank is secondary.** Identity leads on every profile surface. The tier ramp
  survives as a shared system and is always paired with its label, never colour
  alone.
- **A radar never ships without its dimension list.**
- **The angular clip-path lives only in `<AngularPanel>`.** It appears on the
  home hero, the matchup insight, the next-match banner, the VOD and live stages,
  the photo frame and the rank badge. Ordinary cards stay rectangular.
- **Three typefaces, three jobs.** Space Grotesk for display, Inter for anything
  read continuously, JetBrains Mono (tabular figures) for every stat, timer,
  score and dimension value. Numbers in a body font is a bug.
- **Hairline borders, not shadows.** Glow shadows are for hover states only.
- **Sentence case, with one exception.** All-caps is confined to `.hud-label` and
  the home hero wordmark. Button copy names the action.
- **Quiet screens stay quiet.** Forms and empty states get no HUD treatment.
- **Don't start a chart axis at zero when the real range is narrow** — the sleep
  charts start at 5h and say so. The inverse also holds: DNA charts run the full
  0–100 because that is the model's actual range, and truncating them would
  overstate movement.

## Motion

### Two registers

Home animates freely — reveals, ticker, hover lift and glow, counters, traced
radars. The working screens keep more restraint: entrance reveals, the live-strip
slide-in, fast state changes. The button outline spin is the one flourish that
ships everywhere, because it is input-triggered rather than ambient.

### Reveal

`src/components/Reveal.jsx` — IntersectionObserver adds `is-visible`, `delay`
staggers siblings. **The observer is an enhancement, never the only path to
visible.** A hidden document starves IntersectionObserver entirely, so anything
already in the viewport at mount reveals immediately via
`getBoundingClientRect`, and a `visibilitychange` listener re-checks. Keep that
fallback: without it a background tab renders blank. **Do not nest a `Reveal`
inside another** — two entrance animations stack on the same content.

### The traced DNA outline

`.animate-trace` draws a radar's outline rather than fading it in, so the profile
reads as something computed. It depends on `pathLength={1000}` on the polygon;
without that the dash length would have to change with every radar size. Under
reduced motion the dash array is cleared, or the shape would be left invisible.

### The sidebar collapse

Three things are deliberate: icons keep a constant x-position (padding does not
change, so the two states read as one rail narrowing); labels stay mounted at
`opacity: 0` because they are the accessible name for each link; and group
headings collapse their height too, so the narrow rail keeps its rhythm.

### The button outline spin

`.spin-ring` sweeps a lit segment once around a button's perimeter on hover or
focus, then stops. The angle is a **registered custom property**
(`@property --spin-angle`) — that registration is what makes it interpolate
rather than jump. The `mask` shorthand resets `mask-composite`, so composite is
declared **after** it. `ghost` is excluded on purpose: a ring around a bare word
reads as noise.

### Reduced motion

The global rule in `index.css` flattens animations, `.reveal` is forced visible,
`.animate-trace` drops its dash array, and the JS timers in `hooks.js` check the
query themselves. Anything new must survive that rule.

## Performance

The animated backdrop made the page unresponsive once. Three rules keep it cheap:

- **No `backdrop-blur` on panels.** Blurring ~20 elements over a continuously
  animating backdrop pegs the compositor. Panels are translucent via
  `bg-surface/85` instead.
- **Animate `transform` and `opacity` only.**
- **Numerous or large animated elements must be `div`s, not SVG.** A transformed
  div goes to the compositor; an SVG transform animates on the main thread and
  repaints its box each frame.

The radars are an accepted exception: they are few, small, and animate once on
entry rather than continuously.

## Accessibility

- WCAG AA at every token pairing — all of them were re-checked when the palette
  changed, and `text-ink-muted` on `bg-raised` (5.4:1) is the tightest. Re-check
  whenever either token moves.
- Visible 2px `signal` focus ring with offset. If an outline is removed it must
  be replaced in the same change.
- **Radars are `aria-hidden`.** They are decorative once the dimension list
  beside them carries the same values in text — which is why that list is not
  optional.
- Tier is conveyed by colour **and** label text, never colour alone. The same
  holds for matchup favour: every bar carries a signed number.
- Mobile: the sidebar becomes a bottom tab bar (Home / Analyze / Matchup /
  Compete / Network — the bar's column count follows `MOBILE_TABS`), and the
  live-match strip becomes a persistent top pill.
- `GameTile` is decorative (`aria-hidden`, `alt=""`) because the title name is
  always adjacent.
- **Landmark labels must be unique.** The top bar's module nav and the mobile
  bottom bar carry the same links and are both in the DOM at once, so the bottom
  one is labelled "Modules (bottom bar)" and the rail is "Sections".
- A control that toggles state carries `aria-expanded` or `aria-pressed` and a
  label that names what the next press does.

## Game logos

`GameTile` renders a real logo when one exists and a monogram when it doesn't, in
the same clipped genre-tinted frame either way.

- Files live in `src/assets/logos/`, **named by game id**, picked up by an
  `import.meta.glob` at build time. Adding a logo is one file drop.
- `npm run logos` vendors what exists on [Simple Icons](https://simpleicons.org)
  (CC0 1.0). That is six titles; Simple Icons has no mark for the other nineteen.
- Marks are fetched **white, not in brand colour** — several (Fortnite's is
  black) disappear against this UI.
- Only real *game* marks get a `logoSlug`. A publisher logo standing in for one
  of its games would misidentify it.
- These are publishers' trademarks, used nominatively to identify the games the
  platform covers. Take new assets from official press kits and follow their
  rules. See `src/assets/logos/README.md`.
