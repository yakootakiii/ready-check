# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm install
npm run dev            # Vite dev server
npm run build          # production build into dist/
npm run preview        # serve the built output
npm run logos          # vendor game logos (see "Game logos"); --force re-downloads
```

There is no test or lint setup. **The build is not a safety net** — Vite does no
type or reference checking, so a `ReferenceError` from a deleted constant builds
green and crashes in the browser. Verify changes by loading the app, not by
watching the build pass.

## What this is

"Ready Check" — a look-and-feel mockup of a game-agnostic esports platform for
competitive players, originally specced in `ready-check-frontend-mockup-spec.md`.
No backend, no fetching, no auth; all data is generated or fixtured.

**The setting is the Philippines.** Regions are PH regions (NCR, CALABARZON,
Cebu, Davao, Iloilo, Pampanga, Bicol, Baguio, Bacolod, Cagayan de Oro,
Zamboanga, Central Luzon, Laguna, Cavite), venues are PH cities, prize pools are
in pesos via `formatPrize`, and team names, player handles, schools and
organizations are Filipino. Anything new must match — a stray "NA-East" or a
dollar sign is a bug.

Two surfaces with different jobs:

- `/` **Home** — the community hub: featured event, live matches, open scrims,
  the circuit calendar, top players and teams, news, browse-by-game. Loud on
  purpose. In all-titles mode its hero rotates through the five busiest scenes,
  so the landing surface represents the platform rather than whichever game
  sorts first; with one title selected it shows that title's event and does not
  rotate.
- `/overview` and everything under `/prep`, `/compete`, `/recruit` — the
  player's working screens. They share the hub's visual language (HUD panels,
  eyebrows, reveals, gauges) but stay denser and calmer in motion: no ticker,
  no rotating hero, no ambient loops.

Every surface is scoped by the selected title. See **Game-agnostic by
construction** — it is the constraint most likely to be broken by accident.

The spec remains the reference for design tokens and the original screen
intent. Where the work has deliberately departed from it, this file says so;
**trust this file over the spec on those points.**

Stack: React 19 + Vite + Tailwind v4 (`@tailwindcss/vite`), React Router 7,
plain JSX (no TypeScript).

## Pages

| Route | File | What it is |
|---|---|---|
| `/` | `pages/Home.jsx` | The hub. Ticker, rotating hero, platform stats, live matches, open scrims, browse-by-game, events, top players/teams, news, busiest scenes. |
| `/overview` | `pages/Overview.jsx` | Personal dashboard: readiness gauge, next match with countdown and opponent form, stat tiles, today's schedule, on-air card, ladder position, invites, VOD notes. |
| `/prep/scrims` | `pages/Scrims.jsx` | Scrim finder. Dense rows, per-title filters, roster-slot pips. |
| `/prep/vod` | `pages/VodReview.jsx` | VOD review. Timeline tags, click-to-seek, add a tag at the playhead. |
| `/prep/wellness` | `pages/Wellness.jsx` | Readiness gauge, seven-day sleep/load chart, the inputs that feed the score. |
| `/compete/brackets` | `pages/Brackets.jsx` | Title picker (grid of game cards). |
| `/compete/brackets/:gameId` | ″ | That title's live feed plus its running tournaments. |
| `/compete/brackets/:gameId/:eventId` | ″ | One tournament's draw, live feed still available above it. |
| `/compete/live` | `pages/Live.jsx` | Match centre: live viewer when live, next-match countdown when not, pre-match checks, comms. |
| `/compete/diagnostics` | `pages/Diagnostics.jsx` | Platform-aware readiness checks and telemetry. |
| `/league` | `pages/League.jsx` | Every team on the platform: record, win rate, form, backer, top placement. Filter by backing, sort, search. |
| `/league/team/:teamId` | ″ | Team detail: roster with roles, honours, backer, form, tournaments entered. |
| `/league/schools` | `pages/LeagueBackers.jsx` | Schools with an active roster. |
| `/league/schools/:backerId` | ″ | Program detail: rosters by title with members, honours, running and pending fixtures. |
| `/league/orgs` | ″ | Companies operating rosters. Same screen, `kind="company"`. |
| `/league/orgs/:backerId` | ″ | As above. |
| `/recruit/card` | `pages/MyCard.jsx` | Public profile, with per-title profile tabs. |
| `/recruit/orgs` | `pages/OrgSearch.jsx` | Orgs recruiting, plus the player's own listing. |

`Brackets.jsx` holds all three levels and branches on `useParams()`. Picking a
title from the grid also sets the global game picker, so the two never disagree.

`LeagueBackers.jsx` serves both `/league/schools` and `/league/orgs` from one
`KINDS` map — schools and companies have the same shape (both back rosters
across titles), so only the copy, the icon and the pool differ.

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
- `src/nav.js` — the single source for both the desktop rail (`NAV_GROUPS`) and
  the mobile bottom bar (`MOBILE_TABS`: Home / Prep / Compete / Recruit). Adding
  a page means a route in `App.jsx` and an entry here.
- `src/components/TopBar.jsx` — brand, module links, `GameSwitcher`, and the
  live-match strip (a full-width strip from `md` up, a pill below it).
- `src/components/GameSwitcher.jsx` — the title picker. Lives in the top bar
  because the selected title scopes every module. Searchable by name, short
  code, genre or region; grouped by platform.
- `src/components/PolyBackdrop.jsx` — the app-wide animated backdrop, rendered
  once behind every route, `fixed -z-10` and pointer-inert. Layers, back to
  front: three drifting colour blooms, a static halftone grain, the low-poly
  mesh with pulsing vertex nodes and drifting accent shards, three
  counter-rotating instrument rings, twenty-two dust motes, a periodic
  broadcast sweep, and a vignette.
  **No ancestor may have an opaque background** — one paints over it, which is
  why `App.jsx` has no `bg-base` and `body` carries it instead. Every position
  comes from a seeded PRNG so the field never reshuffles.

### Context

- `src/gameContext.jsx` — the selected title, above the router.
  `useGame()` → `{ gameId, game, isAll, setGameId }`. `game` is `null` in
  all-titles mode, so pages needing one concrete title fall back to the
  player's `primaryGameId`.
- `src/live.jsx` — live-match state, above the router because the top bar is
  the one place a live match persists across modules. Toggle from Overview's
  "Ready check" or the Live page's "Go live".

### Components

- `src/components/hud.jsx` — **the primitive set every screen is built from**:
  `HudPanel`, `HudPageHeader`, `HudSection`, `HudLabel`, `LivePip`, `Ticker`,
  `Countdown`, `Gauge`, `StatBar`, `FormRow`, `AnimatedNumber`.
- `src/components/ui.jsx` — down to `Button` and `EmptyState`. Its old
  `Panel`/`PanelHeader`/`PageHeader`/`Stat` were deleted when every screen moved
  to the HUD set; reach for the HUD equivalents.
- `src/components/AngularPanel.jsx` — the only home of the `angular-cut`
  clip-path. Never put that class on an element directly.
- `src/components/GameTile.jsx` — a title's mark: real logo when one exists,
  monogram when it doesn't, same clipped genre-tinted frame either way.
- `src/components/LiveViewer.jsx` — the broadcast stage: scoreboard overlay,
  ticking clock, round history, and a switcher for the title's other feeds.
  Used by `/compete/live` and both bracket levels. There is no real stream to
  embed, so the stage is a treated placeholder that reads as "the feed goes
  here" rather than pretending to be video.
- `src/components/PlayerCard.jsx` — used by both `/recruit/card` and
  `/recruit/orgs`; `orgActions` is the only difference. Takes one `profile`
  (one of the player's titles), so role and stats come from that title.
- `src/components/LeagueTabs.jsx` — the League module's Teams / Schools /
  Organizations switch, shared by every screen under `/league`.
- Also: `Reveal`, `Sidebar`, `MobileTabBar`, `RankBadge`, `Sparkline`,
  `VodTimeline`, `DiagnosticChecklist`, `icons.jsx` (inline SVG set, no icon
  dependency).

`League.jsx` also exports `BackerBadge`, `AccoladeRow` and `placementTone`,
which `LeagueBackers.jsx` reuses — placements are colour-cued gold/silver/bronze
so a podium reads before the text does.

### Support

- `src/hooks.js` — `useCountUp`, `useTickingClock`, `useCarousel`,
  `prefersReducedMotion`.
- `src/tiers.js` — the rank-tier ramp. Tailwind cannot see dynamically composed
  class names, so tier classes are written out in full; extend that map rather
  than interpolating colour into a `className`.
- `src/format.js` — `formatClock` and `formatPrize` (peso pools: `₱2.4M` above
  a million, `₱850k` below). All prize display goes through `formatPrize`.
- `src/index.css` — every design token in a Tailwind v4 `@theme` block, plus
  `angular-cut`, `hud-label`, `hud-corners`, `sheen`, `scanlines`, `spin-ring`
  and all keyframes. Spec token names map to utility names in a comment at the
  top: `text-primary` → `text-ink`, `border` → `border-line`, `bg-base` →
  `bg-base`. **Never hardcode a hex outside this file.**

## Data layer

- `src/data/games.js` — the catalog of 25 titles (12 PC, 9 mobile, 4 console),
  plus `GENRES`, `GAMES_BY_ID`, `genreOf`, `monogram`, `gamesByPlatform`.
- `src/data/generate.js` — **the only source of scene-shaped data.**
  `teamsFor`, `playersFor`, `liveMatchesFor`, `openScrimsFor`, `eventsFor`,
  `newsFor`, `bracketFor(gameId, eventId)`, `activityFor`, `circuitSummaryFor`,
  and `acrossGames(generator, {limit, sortBy})` for the all-titles view.
  Everything derives deterministically from a seed built out of the game id and
  is memoised. Hand-writing 25 scenes would rot immediately, and **seeds must
  stay stable** — a leaderboard that reshuffles between renders reads as broken,
  not live.
- `src/data/mock.js` — only the signed-in player (whose `profiles` are
  per-title) plus readiness, wellness and VOD fixtures.
- `src/data/checks.js` — `diagnosticsFor(platform)` and
  `networkMetricsFor(platform)`.
- `src/data/league.js` — the League module's layer **on top of** `generate.js`,
  not beside it: a team here is the same team that appears in a bracket or a
  ladder, with a backer, accolades and a roster attached. Exports `SCHOOLS`,
  `COMPANIES`, `teamProfile(team)`, `allTeams()`, `findTeam(id)`,
  `backerProfile(id)`, `schoolsWithRosters()`, `companiesWithRosters()`.
  Two rules hold it together:
  - **A backer only takes teams in a region it operates in**, so a Manila
    university never ends up running an EMEA roster. Schools take roughly a
    third of rosters, which suits a platform spanning amateur to semi-pro.
  - **Rosters start from ladder players.** `playersFor` assigns teams
    round-robin so every team fields at least one, and `rosterFor` builds on
    those before generating fill — a team's stars are the same people the
    leaderboards show. Roles are handed out by slot *after* sorting, so a
    five-man roster covers five distinct roles instead of three duelists.
  - A team is entered in **one running circuit plus the next one up**, not every
    live event of its game — otherwise every program fielding it looks like it
    is playing twenty tournaments at once.

## Game-agnostic by construction

The platform covers 25 titles across PC, mobile and console — not one game with
the others bolted on. The rules that keep it that way:

- **Nothing hardcodes a title.** No component may assume Valorant, five-a-side
  play, or even a PC. Every title carries its own `roles`, `stats` (the two
  numbers that scene actually quotes), `unit` (its word for one leg of a series
  — Map / Game / Set / Match / Lobby), `teamSize`, `regions` and `platform`.
- **Read stat labels from the game, never from a fixed list.** A leaderboard
  renders `player.stats` (`[{label, value}]`); it does not render "ACS" and
  "K/D". Mobile Legends shows KDA and Gold/min, Dota shows GPM and XPM, Street
  Fighter shows set win % — all from the same component.
- **`platform` drives real behaviour, not just a label.** Diagnostics swap frame
  rate and peripherals for battery, thermal headroom, background apps and touch
  sampling on mobile, and controller battery on console.
- **Rows carry `gameId`, and the all-titles view shows it.** In `'all'` mode a
  list mixes scenes, so each row needs a `GameTile` stamp or it is unreadable.
- **Genre drives the tile colour**, so a MOBA and a battle royale are
  distinguishable before the name is read. Extend `GENRES` rather than inventing
  per-game colours.
- **Names are Filipino but invented.** Only the game titles and their logos are
  real. Every team, player, school, organization and event name is made up —
  Philippine in character, not a real institution. Every record, roster and
  championship here is fabricated, so attaching one to a real university or org
  would misrepresent it. "Sibol" was removed from the circuit pool for exactly
  this reason: it is the actual PH national programme.
- **Watch for accidental uniformity across titles.** Three bugs of this shape
  have shipped and been fixed: every game showed an identical "2 running"
  because event statuses were a fixed array; org search read all-Diamond because
  sorting across titles by record just surfaces each scene's strongest roster;
  and the League table opened on twenty-five identical `25-2` records because
  `teamsFor` derived strength purely from seed position. `teamsFor` now applies
  per-team jitter on top of position, and accolade placements are rolled rather
  than mapped from strength. When you aggregate or sort across games, check the
  top of the result for clones.

To add a title: append an entry to `GAMES`. Everything else follows.

## One word, two meanings: "title"

Throughout the app a **title** is a game. In the League module a school or
company also wins **titles** meaning championships, and both land on the same
card. The backer cards resolve it by saying "9 games" for the count of games
fielded and reserving the trophy badge for championships won. If you add copy
where both senses could meet, disambiguate the same way.

## Motion

### Two registers

The Home hub animates freely — reveals, ticker, hover lift and glow, counters,
growing bars, live pips, the rotating hero. The working screens keep the spec's
restraint: entrance reveals, the live-strip slide-in, fast state changes.
The button outline spin is the one hub-grade flourish that ships everywhere,
because it is input-triggered rather than ambient. Don't carry the hub's
ambient motion into screens people read for hours.

### The sidebar collapse

`Sidebar.jsx` animates its width while labels fade and slide out. Three things
are deliberate:

- **Icons keep a constant x-position** — padding does not change between states,
  so the two read as one rail narrowing rather than two layouts swapping. An
  icon that re-centres on collapse makes the transition look like a glitch.
- **Labels stay mounted at `opacity: 0`** rather than being removed. They are
  the accessible name for each link; dropping them leaves a screen reader with a
  rail of unlabelled icons. (The `title` attribute is a weaker substitute, and
  it is only there for the mouse tooltip.)
- **Group headings collapse their height too**, so the narrow rail keeps its
  rhythm instead of showing invisible gaps where the labels used to be.

The toggle in `TopBar` takes `railCollapsed` so it can carry `aria-expanded` and
swap its label between "Collapse sidebar" and "Expand sidebar".

### Reveal

`src/components/Reveal.jsx` — IntersectionObserver adds `is-visible`, `delay`
staggers siblings. **The observer is an enhancement, never the only path to
visible.** A hidden document (a page opened in a background tab, or restored
with the session) starves IntersectionObserver entirely, so anything already in
the viewport at mount reveals immediately via `getBoundingClientRect`, and a
`visibilitychange` listener re-checks. Keep that fallback: without it a
background tab renders blank.

### The rotating hero

`useCarousel` resets its timer whenever the index changes, so a manual pick gets
a full dwell rather than a slide yanked away a second later. It skips
auto-advance under reduced motion and takes a `paused` flag the hero drives from
hover and focus — self-advancing content always needs a way to stop it.

### The button outline spin

`.spin-ring` sweeps a lit segment once around a button's perimeter on hover or
keyboard focus, then stops.

- The angle is a **registered custom property** (`@property --spin-angle`). That
  registration is what makes it interpolate — an unregistered `--angle` is an
  untyped string and would jump from 0 to 360 instead of sweeping.
- The ring is a `conic-gradient` on `::after` at `inset: -1px`, masked to its
  own border box (`mask-composite: exclude`) so it hugs the rounded corners.
  The `mask` shorthand resets `mask-composite`, so composite is declared
  **after** it.
- It runs exactly once — the keyframes end at `opacity: 0`, so the button is
  clean while still hovered rather than pulsing.
- `primary` and `secondary` carry it; `ghost` is excluded on purpose, having no
  resting shape — a ring around a bare word reads as noise, not affordance.
  Each variant sets `--spin-color` inline so the segment reads against its fill.

### Reduced motion

The global rule in `index.css` flattens animations and transitions, `.reveal` is
forced visible there so content can't vanish, and the JS timers in `hooks.js`
check the query themselves. Anything new must survive that rule.

## Performance

The animated backdrop made the page unresponsive once. Three rules keep it
cheap — the backdrop currently runs ~47 animations and stays smooth because all
three hold:

- **No `backdrop-blur` on panels.** Blurring ~20 elements over a continuously
  animating backdrop re-rasterises those regions every frame and pegs the
  compositor. Panels are translucent via `bg-surface/85` instead.
- **Animate `transform` and `opacity` only.** Anything that triggers layout or
  a large repaint per frame does not belong in the backdrop.
- **Numerous or large animated elements must be `div`s, not SVG.** An SVG
  transform animates on the main thread and repaints its box each frame, while a
  transformed div goes to the compositor. That is why the rings and motes are
  divs and only the mesh, its eight vertex nodes and ten small shards stay in
  the SVG — rotating three large stroked circles inside the SVG was repainting a
  420px region three times a frame.

Note that FPS cannot be measured from a backgrounded tab: `requestAnimationFrame`
does not run there, so a reading of 0 means the tab is hidden, not that the page
is stalled.

## Design invariants

These make the mockup read as an esports tool rather than a dark-themed SaaS
dashboard. Violating them is the likeliest way to get the design wrong while the
code still "works".

- **The angular clip-path lives only in `<AngularPanel>`.** The spec rationed it
  to three elements; it now appears on the Home hero, Overview's next-match
  banner, the VOD and live stages, the player photo frame and the rank badge.
  It is still a hero device — ordinary cards stay rectangular, and the class
  never goes on an element directly.
- **Colour is data, not decoration.** The rank-tier ramp (Bronze / Silver / Gold
  / Platinum / Diamond) is one shared system across every module. Always pair
  tier colour with the tier label; never colour alone.
- **Three typefaces, three jobs.** Rajdhani for display, Inter for anything read
  continuously, JetBrains Mono (tabular figures) for every stat, timer, score
  and ping value. Numbers in a body font is a bug.
- **Hairline borders, not shadows.** 1px in `border-line`; box-shadows read as
  generic SaaS at this density. Glow shadows are for hover states only.
- **Sentence case, with one exception.** All-caps is confined to `.hud-label`
  and the Home hero headline. Button copy names the action ("Join scrim", not
  "Submit").
- **Quiet screens stay quiet.** Forms and empty states get no HUD treatment.
- **Don't start a chart axis at zero when the real range is narrow.** Both sleep
  charts plot hours that cluster between 6 and 8; on a 0–10 axis every night
  looks identical, so they start at 5h — and the Wellness legend says
  `axis from 5h`, because a truncated axis that isn't labelled overstates the
  differences it appears to reveal.

## Accessibility

- WCAG AA at every token pairing; `text-ink-muted` on `bg-surface` is the
  tightest and should be re-checked whenever either token moves.
- Visible 2px `signal` focus ring with offset. If an outline is removed it must
  be replaced in the same change.
- Tier is conveyed by colour **and** label text, never colour alone.
- Mobile: the sidebar becomes a bottom tab bar (Home / Prep / Compete / League
  / Recruit — the bar's column count follows `MOBILE_TABS`, so adding a tab
  needs no CSS change), and the live-match strip becomes a persistent top pill.
- `GameTile` is decorative (`aria-hidden`, `alt=""`) because the title name is
  always adjacent. Keep it that way, or give it a label.
- **Landmark labels must be unique.** The top bar's module nav and the mobile
  bottom bar carry the same links and are both in the DOM at once, so the bottom
  one is labelled "Modules (bottom bar)" and the rail is "Sections".
- A control that toggles state carries `aria-expanded` and a label that names
  what the next press does — see the sidebar toggle in `TopBar`.

## Game logos

`GameTile` renders a real logo when one exists and a monogram when it doesn't,
in the same clipped genre-tinted frame either way — so partial coverage still
reads as one set.

- Files live in `src/assets/logos/`, **named by game id**, picked up by an
  `import.meta.glob` at build time. Adding a logo is one file drop: no manifest
  to regenerate, no code change, and no failed request for titles without one.
  Accepted: `.svg`, `.png`, `.webp`, `.jpg`.
- `npm run logos` vendors what exists on [Simple Icons](https://simpleicons.org)
  (icon files are CC0 1.0). That is six titles — Valorant, CS2, League of
  Legends, Dota 2, Fortnite, PUBG Mobile. Simple Icons has no mark for the other
  nineteen, including every mobile MOBA.
- Marks are fetched **white, not in brand colour**: Simple Icons serves each in
  its brand colour and several (Fortnite's is black) disappear against this UI.
  A one-colour rendition is the form publishers ship for dark backgrounds.
- Only real *game* marks get a `logoSlug`. A publisher logo standing in for one
  of its games — Activision for Call of Duty, Supercell for Clash Royale —
  would misidentify it, so those keep the monogram.
- These are publishers' trademarks. Using them to identify the games the
  platform covers is nominative use, but press kits generally forbid
  recolouring, distorting or relocking a mark. Take new assets from official
  press kits and follow their rules. See `src/assets/logos/README.md`.

## Known dead code

Superseded but not yet deleted — nothing imports them. Delete or reuse; don't
treat them as live architecture:

- `src/components/LiveMatchBanner.jsx` — replaced by `LiveViewer`. It is the
  only user of the `animate-live-pulse` keyframes.
- `src/components/ReadinessMeter.jsx` — replaced by `Gauge` used inline on
  Overview and Wellness.
- `RankDot` (exported from `RankBadge.jsx`) and `ongoingFor` (from
  `generate.js`) — no callers.
