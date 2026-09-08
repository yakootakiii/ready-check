# OUTPLAY

**Know your game. Know your opponent. Outplay.**

*Competitive Intelligence for Esports*

> Outplay learns how players and teams compete, analyses how their styles
> interact, and turns competitive data into the intelligence needed to gain an
> edge.

This document is the product reference for the mockup in this repository. It
replaces the Ready Check frontend spec, which described a different product:
a readiness-and-tournament hub built around the loop *prepare → compete →
prove*. Where this file and the code disagree, `CLAUDE.md` is the tiebreaker —
it records what the build actually does.

---

## 1. What Outplay is

Outplay is an AI-powered competitive intelligence platform for esports players
and teams. It is not an aggregator. Tournaments, ladders, scrims and profiles
are all present, but they are the substrate, not the product.

The product is the answer to one question:

> **What can we learn from how you compete?**

And the value proposition is the use of that answer:

> Outplay transforms competitive data into an understanding of how players and
> teams play — and uses that understanding to identify the edge in future
> matchups.

It sits at the intersection of six things, and should feel like all of them at
once: esports analytics, competitive intelligence, player development, matchup
analysis, talent discovery, and competitive networking.

**On the AI.** The intelligence is behavioural modelling — embeddings,
clustering, temporal models, matchup analysis. Language models sit at the *end*
of that stack as an explanation layer. Nothing in the UI presents a chat box as
the source of insight, and no screen has an "AI coach" persona. The system is
the intelligence; the words are how it reports.

### What was removed

The following were load-bearing in Ready Check and are deliberately gone:

- the Ready Check name and the readiness callout as the product's centre
- readiness score as the primary metric (it survives as a secondary signal that
  *explains variance*, on one quiet screen)
- the *Prepare → Compete → Prove* loop
- a general-purpose AI coach
- tournament aggregation as the reason to open the app
- profiles that lead with rank

---

## 2. The core loop

    PLAY  →  ANALYZE  →  UNDERSTAND  →  ADAPT  →  OUTPLAY

Every match generates data. That data updates the system's understanding of the
player and the team. The system builds a model of how they compete. That model
is used to analyse future opponents and matchups. After the match, the actual
result is compared against the prediction, and the intelligence improves.

The navigation is this loop. Analyze comes before Matchup, which comes before
Compete, because that is the order the value arrives in.

---

## 3. Competitive DNA

An AI-generated representation of **how** a competitor plays. It is a profile,
never a score, and no screen may reduce it to one number.

**Player dimensions (12):** aggression, consistency, adaptability, pressure
performance, risk-taking, team contribution, decision-making, objective focus,
mechanical performance, tempo, role range, strategic tendency.

**Team dimensions (12):** aggression, coordination, preferred tempo, adaptation,
early game, late game, objective priority, drafting, closing, discipline, under
pressure, role reliance.

Six of each are marked `core` and carry the compact form — a card, a list row, a
comparison strip. The full twelve are for screens with room to read them.

Two properties matter more than the list:

- **Role reliance runs backwards.** It is the one dimension where high is a
  liability. Anything that ranks, colours or compares dimensions has to know
  that, or a team's biggest fragility gets reported as a strength.
- **The profile is derived, not decorated.** A player's DNA follows from their
  rating, their role and their genre; a team's from its record and its form. Two
  screens showing the same competitor show the same shape.

### Competitive identity

The line a recruiter reads instead of a rank. It is *composed* from the shape —
the top dimension supplies the noun, the second the adjective — so twelve
dimensions generate a vocabulary that stays specific:

    Adaptive Aggressor
    High-pressure performer
    Strong mid-game decision-making
    Flexible role pool

Not:

    Rank: Immortal

### Visualisation

A radar is the primary form, because the thing being read is the silhouette —
spiky or round, front-loaded or back-loaded — and two overlaid outlines can be
compared at a glance. It never appears alone: a radar cannot be read to a
precise value, so the numbered dimension list is always beside it, and that list
is what carries the profile to a screen reader.

Two series maximum. Three outlines on one polar grid stop being a comparison.

---

## 4. Matchup Intelligence — the flagship

Everywhere else asks "how good is this team". Outplay asks:

> **How does your style interact with theirs?**

For an upcoming match the system reads both Competitive DNA profiles and
produces: the opponent's strongest tendencies, their exploitable ones, expected
tempo, likely win conditions, the style clash, favourable and unfavourable
dimensions, and the areas to prepare.

The output is written the way a coach would say it:

> **Matchup Insight**
>
> Your team performs significantly better against slower, objective-focused
> teams but struggles against early aggression.
>
> The opponent shows a high early-pressure tendency.
>
> **Primary concern:** Early-game tempo.
>
> **Potential edge:** Your team has stronger late-game consistency.

Rules the screen holds to:

- **A gap under six points is shown as even.** That is inside the model's own
  noise, and putting a recommendation on a rounding error is how an analytics
  product loses a coach.
- **The win projection is small and carries its band.** A matchup screen whose
  largest element is a win percentage has quietly become a betting site.
  Confidence widens the band rather than moving the number.
- **Blue is you, orange is them, green is an advantage** — on every surface, so
  a comparison reads before a word of it does.

---

## 5. Post-match intelligence

After a match Outplay compares what the model expected against what actually
happened, and reports the gap:

| | |
|---|---|
| **Prediction** | Opponent expected to apply heavy early pressure. |
| **Reality** | Opponent played defensively for the first 10 minutes and shifted aggression after gaining an objective advantage. |
| **New insight** | Opponent's aggression is conditional on objective control. |

Each observation is graded `confirmed`, `shifted` or `surprise`. Only `surprise`
teaches the model much, and a `shifted` read scores as half a hit — scoring it
as a full one would let the system report a perfect week in which it mis-sized
every call it made.

Discoveries are always **conditional** ("their aggression is conditional on X"),
because that is what one match actually reveals. A single result moves a
dimension by a point or two; anything larger is fitting noise.

---

## 6. Outplay Competitive Passport

A persistent competitive identity that travels with a player: Competitive DNA,
match history, performance trends, roles, tournament history, team history,
strengths, weaknesses, notable performances, improvement trajectory, and
verified achievements.

Identity and DNA lead. Rank, rating and win rate are supporting evidence further
down the card. The passport looks the same to the player and to an org — one
that changed depending on who was reading it would not be a passport.

"Verified" means the result was checked against a recorded outcome, and
self-reported entries say so.

---

## 7. Talent Intelligence

Recruitment posed as compatibility rather than ranking.

Instead of *find players with high rank*, an organisation asks *find players who
complement our Competitive DNA*. The system reads a roster's own profile, names
what it is missing, and ranks candidates by whether they close it:

**Roster fit** — this team needs stronger objective control, a flexible support,
and a consistent late-game player.

A Gold-tier support who fills the exact gap outranks a Diamond duelist who
duplicates the strongest seat. Every score shows the reasons underneath it: a
compatibility number nobody can interrogate is a rank with extra steps.

The same model runs in reverse for players looking for a roster.

Concepts covered: player–team compatibility, roster gap analysis, role fit,
playstyle fit, complementary DNA, emerging talent, development trajectory.

---

## 8. Competitive Network

The ecosystem, kept but subordinated to the intelligence layer:

    Players → Teams → Schools → Organizations → Matches → Tournaments → Games

Schools remain first-class entities. The platform launches into a scene where
the university programme is often the entire pipeline, and filing schools under
a generic "orgs" list would misrepresent how Philippine esports works.

It is not a social network. There is no feed, no follower count and no posting.

---

## 9. Philippine focus

Regions are PH regions (NCR, CALABARZON, Cebu, Davao, Iloilo, Pampanga, Bicol,
Baguio, Bacolod, Cagayan de Oro, Zamboanga, Central Luzon, Laguna, Cavite),
venues are PH cities, prize pools are in pesos, and team names, player handles,
schools and organisations are Filipino. A stray "NA-East" or a dollar sign is a
bug.

The interface should read as a modern global esports technology platform that
happens to launch in the Philippines — not as a localised or government product.

Every institution, roster, record and championship is **invented**. Only the
game titles and their logos are real.

---

## 10. Games, and honest coverage

The architecture is modular and multi-title — 25 games across PC, mobile and
console, each carrying its own roles, stat vocabulary, unit of play, team size
and regions. Nothing hardcodes a title.

But the MVP models **one game properly** rather than claiming twenty-five, and
the product says so. `INTEL_COVERAGE` grades every title:

- **Full** — Competitive DNA, matchup intelligence and post-match learning are
  live. Valorant.
- **Calibrating** — the model is still settling; confidence is shown as
  provisional. MLBB, CS2, Dota 2, League of Legends.
- **Ecosystem only** — ladders, teams, tournaments and scrims are covered;
  behavioural modelling is not live yet. Everything else.

Coverage is stated on every intelligence surface. A platform that showed the
same confident profile for all twenty-five would be lying about the thing it is
selling.

Genre supplies the vocabulary an insight uses, so "objective control" means
towers in a MOBA, site control in a tactical shooter and zone timing in a battle
royale — seven lexicon entries covering twenty-five titles.

---

## 11. Navigation

| Module | Screens |
|---|---|
| **Home** | Competitive overview, next match, recent insights, performance trends |
| **Analyze** | Competitive DNA · Match analysis · Performance · VOD intel · Condition |
| **Matchup** | Next match · Opponents |
| **Compete** | Match centre · Tournaments · Scrims · Setup check |
| **Network** | Players · Teams · Schools · Organizations · Talent |
| **Passport** | The player's own competitive profile |

---

## 12. Homepage

Hero: the wordmark, the tagline, the supporting statement, **Analyse my game**
as the primary call to action and **Explore competition** as the secondary — and
beside it a radar carrying the reader's own shape against their next opponent's,
because that image is the thesis.

Below it, in order: Your Competitive DNA · Next Match · Your Edge · Watch Out ·
Recent insights · Performance evolution · the ecosystem · how the intelligence
is built.

Ecosystem content sits *below* the intelligence. An aggregator is the thing this
product is deliberately not.

---

## 13. AI architecture

    Data layer
      match data · player statistics · team statistics · VODs ·
      tournament history · competitive passports
                              ↓
    Feature engineering
      behavioural features · temporal patterns · performance features ·
      team interaction features
                              ↓
    Competitive intelligence engine
      player embeddings · team embeddings · style clustering ·
      temporal modelling · matchup analysis · prediction · anomaly detection
                              ↓
    Competitive DNA
                              ↓
    Matchup Intelligence
                              ↓
    Actionable insights

Drawn on the homepage with the weight in the middle: inputs quiet, the engine
heavy, outputs at the bottom as the result of everything above them. A version
of this diagram with a chat box at the top would be describing a different,
weaker product.

---

## 14. Visual direction

Modern, competitive, intelligent, technical, premium, esports-native, slightly
futuristic. **Professional esports analytics + modern AI platform + competitive
dashboard** — not arcade neon.

Credible to a player, a coach, a university programme, a recruiter and a
tournament operator at the same time.

### Colour is meaning

| Token | Means |
|---|---|
| `signal` `#6C8CFF` | you, your side, the intelligence layer |
| `ember` `#FF6B4A` | the opponent, anything live, anything being warned about |
| `edge` `#35D6A4` | an advantage: a favourable dimension, a positive delta, a win |

The rank-tier ramp (bronze → diamond) survives as one shared system, but rank is
a secondary readout now. Every token pairing meets WCAG AA.

### Type

Three typefaces, three jobs. **Space Grotesk** for display — technical rather
than arcade, which is what makes the product readable as analytics. **Inter**
for anything read continuously. **JetBrains Mono**, tabular figures, for every
stat, timer, score and dimension value. Numbers in a body font are a bug.

### Structure

Hairline borders, not shadows. The angular clip-path stays a rationed hero
device. All-caps is confined to HUD labels and the home hero. Sentence case
everywhere else, and button copy names the action.

---

## 15. The principle to hold

Do not let Outplay drift back into being another esports platform that
aggregates tournaments, profiles and statistics. Every screen should be
answerable to the same question:

> **What can we learn from how you compete?**

If a panel cannot answer it, it belongs below the ones that can.
