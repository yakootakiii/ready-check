/**
 * The intelligence layer described honestly: what the system is made of, and
 * what it has recently worked out.
 *
 * `PIPELINE` is the architecture the product actually claims - data, features,
 * an engine of embeddings and temporal models, and only then Competitive DNA,
 * matchup intelligence and the insights a player reads. The order matters
 * because it is the argument: the intelligence comes from modelling how people
 * compete, and the language layer only explains what the model already found.
 * A screen that presented a chat box as the source would be describing a
 * different, weaker product.
 *
 * `insightFeedFor` is the other side of the same coin - not a description of
 * the system but its output for one title, assembled from the same debriefs,
 * matchups and DNA movements the rest of the app reads. Nothing here is a
 * separate stream of made-up notifications: every row links to the screen that
 * produced it.
 */
import { GAMES, GAMES_BY_ID, coverageKeyOf } from './games'
import { deltasFrom } from './dna'
import { myDna, nextFixture, recentMatchesFor } from './matchup'

const cache = new Map()
const memo = (key, build) => {
  if (!cache.has(key)) cache.set(key, build())
  return cache.get(key)
}

function seedFrom(...parts) {
  let h = 2166136261
  for (const ch of parts.join('|')) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/**
 * The stack, top to bottom. `kind` drives how a stage is drawn: inputs are
 * quiet, the engine is the weighted middle, outputs are what the user actually
 * touches.
 */
export const PIPELINE = [
  {
    key: 'data',
    kind: 'input',
    label: 'Data layer',
    note: 'Everything the platform already sees, before any of it means anything.',
    items: [
      'Match data',
      'Player statistics',
      'Team statistics',
      'VOD timelines',
      'Tournament history',
      'Competitive passports',
    ],
  },
  {
    key: 'features',
    kind: 'input',
    label: 'Feature engineering',
    note: 'Raw results become behaviour: not what the score was, but how it was reached.',
    items: [
      'Behavioural features',
      'Temporal patterns',
      'Performance features',
      'Team interaction features',
    ],
  },
  {
    key: 'engine',
    kind: 'engine',
    label: 'Competitive intelligence engine',
    note: 'Where competitors become comparable objects rather than rows of statistics.',
    items: [
      'Player embeddings',
      'Team embeddings',
      'Style clustering',
      'Temporal modelling',
      'Matchup analysis',
      'Outcome prediction',
      'Anomaly detection',
    ],
  },
  {
    key: 'dna',
    kind: 'output',
    label: 'Competitive DNA',
    note: 'A profile of how a player or team competes, across twelve dimensions.',
    items: ['Player DNA', 'Team DNA', 'Evolution over time'],
    to: '/analyze',
  },
  {
    key: 'matchup',
    kind: 'output',
    label: 'Matchup intelligence',
    note: 'Two profiles read against each other, dimension by dimension.',
    items: ['Style interaction', 'Edges and concerns', 'Expected tempo', 'Prep focus'],
    to: '/matchup',
  },
  {
    key: 'insights',
    kind: 'output',
    label: 'Actionable insights',
    note: 'Explained in plain language. The language layer explains the model; it is not the model.',
    items: ['Pre-match briefs', 'Post-match learning', 'Roster fit', 'Development trajectory'],
    to: '/analyze/matches',
  },
]

/**
 * Volume figures for the stack, scaled to how busy a scene actually is.
 * Seeded per title, so the number under "matches ingested" does not jump every
 * time the page is re-rendered.
 */
export function pipelineStatsFor(gameId) {
  return memo(`pipeline:${gameId}`, () => {
    const ids = gameId === 'all' ? GAMES.map((g) => g.id) : [gameId]
    const totals = ids.reduce(
      (acc, id) => {
        const game = GAMES_BY_ID[id]
        const rand = rng(seedFrom('pipeline', id))
        acc.matches += Math.round((8 + rand() * 40) * 1000 * game.scale)
        acc.profiles += Math.round((0.6 + rand() * 6) * 1000 * game.scale)
        acc.vods += Math.round((0.4 + rand() * 3) * 1000 * game.scale)
        return acc
      },
      { matches: 0, profiles: 0, vods: 0 },
    )
    return {
      ...totals,
      // Features are per-match and fixed by the model, not by the scene.
      features: 214,
      dimensions: 12,
      titlesModelled: GAMES.filter((g) => coverageKeyOf(g) !== 'planned').length,
    }
  })
}

/* --- The insight feed ----------------------------------------------------- */

const TONES = {
  discovery: { tone: 'signal', eyebrow: 'New tendency' },
  watch: { tone: 'ember', eyebrow: 'Watch out' },
  edge: { tone: 'edge', eyebrow: 'Your edge' },
  shift: { tone: 'signal', eyebrow: 'Profile shift' },
}

/**
 * What the system has worked out lately, newest first.
 *
 * Assembled from the same objects the detail screens render, so a row here and
 * the screen it links to can never tell different stories.
 */
export function insightFeedFor(gameId) {
  return memo(`insights:${gameId}`, () => {
    const mine = myDna(gameId)
    const fixture = nextFixture(gameId)
    const recent = recentMatchesFor(gameId)
    const rows = []

    // 1. Tendencies learned from the last two matches.
    for (const match of recent.slice(0, 2)) {
      rows.push({
        id: `${match.id}-disc`,
        kind: 'discovery',
        ...TONES.discovery,
        title: match.debrief.discovery.text,
        body: match.debrief.discovery.effect,
        source: `From ${match.opponent.name}, ${match.played}`,
        to: '/analyze/matches',
      })
    }

    // 2. The single most important thing about the next opponent.
    if (fixture.matchup.primaryConcern) {
      rows.push({
        id: `${fixture.id}-watch`,
        kind: 'watch',
        ...TONES.watch,
        title: `${fixture.matchup.primaryConcern.label} against ${fixture.opponent.name}`,
        body: fixture.matchup.theirStrengths[0].text + '.',
        source: `Next fixture · ${fixture.kind}`,
        to: '/matchup',
      })
    }

    // 3. And the best thing about it.
    if (fixture.matchup.primaryEdge) {
      rows.push({
        id: `${fixture.id}-edge`,
        kind: 'edge',
        ...TONES.edge,
        title: `${fixture.matchup.primaryEdge.label} edge worth ${Math.round(
          fixture.matchup.primaryEdge.advantage,
        )} points`,
        body: fixture.matchup.theirExploitable[0].text + '.',
        source: `Next fixture · ${fixture.opponent.name}`,
        to: '/matchup',
      })
    }

    // 4. The dimension of your own profile that moved most this window.
    const deltas = deltasFrom(mine.history)
    const [key, delta] = Object.entries(deltas).sort(
      (a, b) => Math.abs(b[1]) - Math.abs(a[1]),
    )[0]
    const moved = mine.ordered.find((d) => d.key === key)
    rows.push({
      id: `${mine.id}-shift`,
      kind: 'shift',
      ...TONES.shift,
      title: `${moved.label} ${delta >= 0 ? 'up' : 'down'} ${Math.abs(delta)} this window`,
      body: `${mine.name}'s profile is reading ${moved.value} on ${moved.label.toLowerCase()}, ${
        delta >= 0 ? 'the strongest movement in the roster this month' : 'the sharpest drop this month'
      }.`,
      source: 'Competitive DNA · your team',
      to: '/analyze/trends',
    })

    return rows
  })
}
