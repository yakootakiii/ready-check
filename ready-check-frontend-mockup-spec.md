# Ready Check — Frontend Mockup Spec

A build brief for a frontend mockup of a freemium, game-agnostic esports
development platform. Feed this file to Claude Code and ask it to scaffold
the mockup (suggested stack at the bottom).

Working name: **Ready Check** — borrowed from the raid-prep callout gamers
already know. The whole platform is about confirming you're actually ready
before it counts, so the name should show up as a literal UI element (the
pre-match readiness screen), not just a logo.

---

## 1. What we're designing

Four connected surfaces for one player-facing product:

1. **Prep** — scrim finder, VOD review, wellness/readiness tracking
2. **Compete** — brackets, live match tools, diagnostics
3. **Recruit** — player profile/portfolio, org search and matching
4. **Profile** — the public player card that ties it all together

Audience: competitive players from amateur to semi-pro, across any game
title, mostly viewing on a second monitor or phone between matches. They
already live inside HUDs, scoreboards, and rank badges — the UI should feel
like it belongs in that world, not like a generic SaaS dashboard wearing a
dark theme.

---

## 2. Design principles

- **Broadcast HUD, not cyberpunk.** Reference esports tournament overlays
  and scoreboards — angular clipped panels, dense stat readouts, rank-tier
  color coding — rather than generic neon-on-black. No single acid-green
  accent glowing on pure black; that reads as a template, not a competitor's
  tool.
- **Color carries information.** The accent system doubles as the rank-tier
  system used throughout the product (see below). Color isn't decoration —
  a badge's color tells you someone's tier before you read the label.
- **One bold gesture per screen.** The live-match banner or rank badge gets
  the angular cut treatment. Everything around it (tables, forms, settings)
  stays calm, rectangular, and easy to scan — competitive players are
  reading this mid-session, not admiring it.
- **Numbers get a different typeface than words.** Stats, timers, and
  scores render in monospace, like a scoreboard readout. Everything else is
  humanist and easy to read at a glance.
- **Respect the quiet moments too.** Settings, forms, and empty states
  don't need HUD treatment — over-styling every screen is how mockups start
  looking like a demo reel instead of a tool people use for hours a day.

---

## 3. Design tokens

### Color

| Token | Hex | Use |
|---|---|---|
| `bg-base` | `#10121A` | App background — deep graphite with a blue undertone, not pure black |
| `bg-surface` | `#191C29` | Cards, panels |
| `bg-raised` | `#222639` | Modals, dropdowns, hover states |
| `border` | `#2E3244` | Hairlines, dividers |
| `text-primary` | `#EDEFF5` | Body text, headings — off-white, not pure white |
| `text-muted` | `#8B90A3` | Secondary text, timestamps, labels |
| `signal` | `#4CE0D2` | Primary accent — live indicators, primary actions, focus states |
| `ember` | `#FF6B3D` | Secondary accent — alerts, streaks, rank-up moments. Used sparingly |

**Rank-tier ramp** (used on badges, leaderboards, profile borders —
consistent across every module so a tier is recognizable at a glance):

| Tier | Hex |
|---|---|
| Bronze | `#B5793E` |
| Silver | `#A9AFC0` |
| Gold | `#E4B94E` |
| Platinum | `#4FC3B0` |
| Diamond | `#8C7BE0` |

### Typography

Three roles, three typefaces — each doing a distinct job rather than one
family stretched thin:

- **Display** — `Rajdhani` (600/700). Headlines, page titles, the readiness
  score, rank names. Condensed and angular, the way broadcast title cards
  set player names.
- **Body** — `Inter` (400/500). Everything you read continuously:
  descriptions, settings, form labels, table cells. Optimized for
  legibility, not personality.
- **Data / mono** — `JetBrains Mono` (400/500). Stats, timers, K/D
  ratios, countdowns, ping numbers. Tabular figures so columns of numbers
  align.

Type scale (display / body):

```
Display XL   40px / 44px   — hero readouts (readiness score, countdown)
Display L    28px / 32px   — page titles
Display M    20px / 24px   — section headers, card titles
Body L       16px / 26px   — primary reading text
Body M       14px / 22px   — default UI text
Body S       12px / 18px   — labels, captions, timestamps
Mono M       14px / 20px   — inline stats
Mono L       22px / 26px   — featured stats (countdown, score)
```

Sentence case throughout — no tracked-out all-caps eyebrow labels, no
middle-dot separators in metadata strings. Keep button copy in active
voice describing exactly what happens: "Join scrim," not "Submit."

### Shape & spacing

- Base radius: `6px` on cards, inputs, buttons — enough to feel modern
  without going pill-shaped.
- **Angular cut** (the one bold structural device): a clipped corner on
  hero elements only — the live-match banner, rank badge frame, and the
  primary CTA on the readiness screen. `clip-path: polygon(0 0, 100% 0,
  100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)`. Nowhere else —
  regular cards stay rectangular so the cut still reads as a signal, not a
  theme applied everywhere.
- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48px`.
- Borders: 1px hairlines in `border`, not shadows — shadows read as
  generic SaaS-card default at this density.

---

## 4. App shell

```
┌──────────────────────────────────────────────────────────────────┐
│ READY CHECK    Overview  Prep  Compete  Recruit         🔔  [PFP] │
├───────────┬────────────────────────────────────────────────────────┤
│ ▎Overview │                                                        │
│  Scrims   │              main content area                        │
│  VOD      │                                                        │
│  Wellness │                                                        │
│ ───────── │                                                        │
│  Brackets │                                                        │
│  Live     │                                                        │
│  Diag.    │                                                        │
│ ───────── │                                                        │
│  My card  │                                                        │
│  Org      │                                                        │
│   search  │                                                        │
└───────────┴────────────────────────────────────────────────────────┘
```

Left rail is icon + label, collapsible to icons-only. Active section gets
a `signal`-colored left border on its row, not a filled background — keeps
the rail quiet. Top bar stays fixed; it's the one place a live-match state
persists no matter which module you're in (a slim "LIVE — Map 2, 14:32"
strip appears here during a match, tapping it jumps to Compete).

---

## 5. Page mockups

### 5.1 Overview (home)

```
┌─────────────────────────────────────────────┐
│  Good evening, Kade                          │
│                                               │
│  ┌───────────────────┐  ┌──────────────────┐ │
│  │ READINESS          │  │ NEXT MATCH        │ │
│  │                     │  │ (angular banner)  │ │
│  │    82               │  │ Rival Esports     │ │
│  │  ▁▂▃▅▇ trending up  │  │ Tomorrow, 7:00 PM │ │
│  │  Sleep ok · Load high│  │ [Ready Check →]  │ │
│  └───────────────────┘  └──────────────────┘ │
│                                               │
│  Scrim invites (3)          Recent VOD notes  │
│  ┌─────────────────┐        ┌───────────────┐ │
│  │ Team Vortex      │        │ Map 2 — rotate│ │
│  │ Gold · 8pm       │        │ timing, 3 tags│ │
│  │ [Accept] [Pass]  │        └───────────────┘ │
│  └─────────────────┘                          │
└─────────────────────────────────────────────┘
```

The **readiness score** is the hero element — one number, built from sleep,
practice load, and recent match stress, with a one-line plain-language
reason under it ("Sleep ok, load high" rather than a jargon breakdown).
This is the "big number" treatment the brief actually earns, since
readiness is the single thing a player wants to know before deciding how
hard to push today.

### 5.2 Prep → Scrim finder

```
┌─────────────────────────────────────────────┐
│  Find a scrim                [Filters ▾]     │
│  Game: Valorant   Rank: Gold–Plat   Region: NA│
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ ● Team Vortex          Gold      NA-East │ │
│  │   Open 8:00–10:00 PM   Bo3               │ │
│  │                          [Request scrim] │ │
│  ├─────────────────────────────────────────┤ │
│  │ ● Nine Lives            Plat     NA-West │ │
│  │   Open now              Bo1               │
│  │                          [Request scrim] │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

Rank shown as a colored dot + label using the tier ramp — scannable
without reading. List rows, not cards-in-a-grid: this is a dense
scheduling task, not a browsing task.

### 5.3 Prep → VOD review

```
┌─────────────────────────────────────────────┐
│  [ video player ]                 12:45/28:10│
│  ├──●───────────────────────────────────────┤│
│     ▲tag        ▲tag  ▲tag                    │
│                                               │
│  Tags on this VOD                             │
│  06:12  Rotation late — B site               │
│  14:03  Good trade, follow up slow            │
│  22:40  Econ mismanagement                    │
│                          [+ Add tag at 12:45] │
└─────────────────────────────────────────────┘
```

Timeline tags are the core interaction — click a tag, jump to that
timestamp. Keep the player itself unstyled/native-feeling; the value is in
the tagging layer, not a custom video chrome.

### 5.4 Compete → Live match / diagnostics

```
┌─────────────────────────────────────────────┐
│  ⬡ LIVE — Map 2                    14:32     │
│  vs. Rival Esports          13 — 11 (mono)   │
│                                               │
│  Pre-match check                             │
│  ✓ Ping: 24ms         ✓ Peripherals detected │
│  ✓ Mic check passed   ⚠ Frame rate unstable  │
│                                               │
│  [ View bracket ]        [ Open comms ]      │
└─────────────────────────────────────────────┘
```

This is the other angular-cut moment — the live banner. Diagnostics use
plain check/warning icons, not colored pills for every row; a warning
should visually interrupt the otherwise-calm checklist.

### 5.5 Recruit → Org search / player card

```
┌─────────────────────────────────────────────┐
│  ┌───────────────┐   Kade "Vantage" Ruiz     │
│  │  (angular      │   Duelist · Valorant     │
│  │   player photo │   ◆ Diamond               │
│  │   frame, tier-  │                          │
│  │   colored edge)│   Win rate  58%           │
│  └───────────────┘   Scrims logged  142       │
│                       Availability  Evenings ET│
│                                               │
│  Highlight VODs (3)      [Message]  [Invite] │
└─────────────────────────────────────────────┘
```

The player card is the recruitment unit — think "LinkedIn profile" crossed
with a trading card, but restrained: one tier-colored frame edge, stats in
mono, no badges-on-badges clutter. This card is also literally the public
Profile page, just without the org-facing actions.

---

## 6. Core components

| Component | Notes |
|---|---|
| Rank badge | Tier ramp color, angular frame, used on profile, leaderboard, scrim rows |
| Readiness meter | Single big mono number + sparkline + one-line reason |
| Live match banner | Angular cut, `signal` accent, persists in top bar during a match |
| Scrim row | List item, not a card — rank dot, time window, one primary action |
| VOD timeline tag | Small marker on scrubber, click-to-seek, hover shows note |
| Diagnostic checklist | Check/warn/fail icons, no colored pill overuse |
| Player card | Tier-framed photo, mono stats block, used in both Recruit and Profile |

---

## 7. Motion

One orchestrated moment, not hover effects everywhere:

- When a match goes live, the top-bar strip slides in once and the live
  banner's border pulses subtly for a few seconds, then settles — it
  should register the state change without staying distracting for the
  next two hours of play.
- Readiness score animates a brief count-up on load, once per session.
- Everything else (buttons, list rows, tabs) gets a fast, simple state
  change — no slide-up entrances, no staggered card reveals. Respect
  `prefers-reduced-motion`.

---

## 8. Accessibility & responsive notes

- Text/background contrast meets WCAG AA at every token pairing above
  (verify `text-muted` on `bg-surface` specifically — it's the tightest
  pairing).
- Visible keyboard focus ring in `signal`, 2px, offset — never remove
  outline without replacing it.
- Rank tiers are conveyed by color **and** label text, never color alone.
- Mobile: sidebar collapses to a bottom tab bar (Overview / Prep / Compete
  / Recruit); the live-match strip becomes a persistent top pill instead
  of a full banner.

---

## 9. Suggested build stack for Claude Code

Ask Claude Code to scaffold this as:

- **React + Vite + Tailwind CSS**, with the tokens above set up as
  Tailwind theme extensions (colors, fontFamily, borderRadius) rather than
  hardcoded classes.
- Load `Rajdhani`, `Inter`, and `JetBrains Mono` from Google Fonts.
- Build the app shell first (sidebar + top bar + routing between the four
  modules), then the Overview page, then one representative screen per
  module from section 5 — static/mock data is fine, this is a look-and-feel
  mockup, not a working backend.
- Keep the angular clip-path treatment isolated to a single reusable
  `<AngularPanel>` component so it stays a deliberate accent instead of
  spreading everywhere.

Prompt starter for Claude Code:

> Build a React + Tailwind mockup of the app shell and the five pages
> described in this spec (`ready-check-frontend-mockup-spec.md`). Use mock
> data. Prioritize the design tokens and the Overview page first, then the
> remaining four screens.
