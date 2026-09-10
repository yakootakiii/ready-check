/**
 * Competitive DNA - the model of *how* someone competes.
 *
 * This is the layer that separates Outplay from an ecosystem site. A rating
 * answers "how good is this player"; Competitive DNA answers "what kind of
 * competitor is this", which is the only question a matchup can be built on.
 *
 * Three rules hold the model together:
 *
 * - **A DNA is a profile, never a score.** Nothing here reduces to one number,
 *   and no screen may present it as one. The dimensions are read together, as
 *   a shape - that is the whole point of the thing.
 * - **It is derived, not decorated.** A player's DNA follows from their rating,
 *   their role and the genre they compete in, so the profile agrees with the
 *   ladder rather than contradicting it. A team's follows from its record and
 *   its form. Two screens showing the same competitor show the same shape.
 * - **It is deterministic.** Seeded from the entity id, memoised, and stable
 *   across renders. A behavioural profile that drifted between navigations
 *   would read as noise, which is exactly what it is meant not to be.
 *
 * Depth is honest: `INTEL_COVERAGE` in games.js says which titles are actually
 * modelled, and confidence here is reported from sample size, not asserted.
 */
import { GAMES_BY_ID, coverageKeyOf, lexiconOf } from './games'

/* --- Dimensions ----------------------------------------------------------- */

/**
 * `core` marks the six dimensions that carry a compact profile - a card, a
 * list row, a comparison strip. The full twelve are for the Analyze screen,
 * where there is room to read them.
 */
export const PLAYER_DIMENSIONS = [
  { key: 'aggression', label: 'Aggression', short: 'AGG', core: true,
    blurb: 'How much of their game is spent taking space rather than holding it.' },
  { key: 'consistency', label: 'Consistency', short: 'CON', core: true,
    blurb: 'How little their output moves from one game to the next.' },
  { key: 'adaptability', label: 'Adaptability', short: 'ADP', core: true,
    blurb: 'How quickly they change approach once something stops working.' },
  { key: 'pressure', label: 'Pressure performance', short: 'PRS', core: true,
    blurb: 'Output in closing rounds, elimination games and deciders.' },
  { key: 'risk', label: 'Risk-taking', short: 'RSK', core: true,
    blurb: 'Appetite for high-variance lines when a safe one exists.' },
  { key: 'impact', label: 'Team contribution', short: 'IMP', core: true,
    blurb: 'How much the players around them improve when they are on.' },
  { key: 'decision', label: 'Decision-making', short: 'DEC',
    blurb: 'Quality of the read when a call has to be made quickly.' },
  { key: 'objective', label: 'Objective focus', short: 'OBJ',
    blurb: 'How much of their play is organised around the objective.' },
  { key: 'mechanics', label: 'Mechanical performance', short: 'MEC',
    blurb: 'Raw execution ceiling, independent of the decisions around it.' },
  { key: 'tempo', label: 'Tempo', short: 'TMP',
    blurb: 'The pace they push a game towards when they are dictating.' },
  { key: 'versatility', label: 'Role range', short: 'RNG',
    blurb: 'How many roles they hold at a competitive standard.' },
  { key: 'strategy', label: 'Strategic tendency', short: 'STR',
    blurb: 'How much of their edge comes from preparation rather than play.' },
]

export const TEAM_DIMENSIONS = [
  { key: 'aggression', label: 'Aggression', short: 'AGG', core: true,
    blurb: 'How often they take the first contact rather than answer it.' },
  { key: 'coordination', label: 'Coordination', short: 'CRD', core: true,
    blurb: 'How tightly the five move as one unit.' },
  { key: 'tempo', label: 'Preferred tempo', short: 'TMP', core: true,
    blurb: 'The pace they are trying to force the game to run at.' },
  { key: 'adaptation', label: 'Adaptation', short: 'ADP', core: true,
    blurb: 'How much they change between games of a series.' },
  { key: 'earlyGame', label: 'Early game', short: 'ERL', core: true,
    blurb: 'Strength in the opening phase before the game has a shape.' },
  { key: 'lateGame', label: 'Late game', short: 'LTE', core: true,
    blurb: 'Strength once the game is decided by execution under load.' },
  { key: 'objectives', label: 'Objective priority', short: 'OBJ',
    blurb: 'How much of their plan is organised around the objective.' },
  { key: 'drafting', label: 'Drafting', short: 'DRF',
    blurb: 'How much edge they generate before the game starts.' },
  { key: 'closing', label: 'Closing', short: 'CLS',
    blurb: 'How reliably a winning position becomes a win.' },
  { key: 'discipline', label: 'Discipline', short: 'DSC',
    blurb: 'How rarely they give away a position they had already won.' },
  { key: 'pressure', label: 'Under pressure', short: 'PRS',
    blurb: 'Output in elimination games and deciding maps.' },
  { key: 'roleReliance', label: 'Role reliance', short: 'RLC',
    blurb: 'How much of the team depends on one seat firing. High is fragile.' },
]

/**
 * Role reliance is the one dimension where high is a liability rather than a
 * strength, so anything that ranks or colours dimensions has to know it.
 */
export const INVERTED_DIMENSIONS = new Set(['roleReliance'])

export const dimensionsFor = (kind) => (kind === 'team' ? TEAM_DIMENSIONS : PLAYER_DIMENSIONS)

export const coreDimensionsFor = (kind) => dimensionsFor(kind).filter((d) => d.core)

const DIMENSION_INDEX = {
  player: Object.fromEntries(PLAYER_DIMENSIONS.map((d) => [d.key, d])),
  team: Object.fromEntries(TEAM_DIMENSIONS.map((d) => [d.key, d])),
}

export const dimensionOf = (kind, key) => DIMENSION_INDEX[kind === 'team' ? 'team' : 'player'][key]

/* --- Seeded helpers ------------------------------------------------------- */

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

const cache = new Map()
const memo = (key, build) => {
  if (!cache.has(key)) cache.set(key, build())
  return cache.get(key)
}

const clamp = (n, lo = 18, hi = 97) => Math.max(lo, Math.min(hi, Math.round(n)))

/**
 * Fit a freshly generated value into the model's range.
 *
 * Hard clipping is the obvious way and the wrong one. Strong competitors
 * generate raw values well past the ceiling, so several of their dimensions
 * pin at the same number and the profile stops telling the best teams apart —
 * which is exactly where a scouting read needs the most resolution. Compressing
 * the tails preserves ordering while keeping the top of the range open.
 *
 * Only for building a profile. `dnaHistory` walks backwards through values that
 * have already been shaped, and compressing them again at every step would drag
 * the whole history toward the soft band and invent a downward trend.
 */
const SOFT_HIGH = 78
const SOFT_LOW = 32

const shape = (n) =>
  clamp(
    n > SOFT_HIGH
      ? SOFT_HIGH + (n - SOFT_HIGH) * 0.45
      : n < SOFT_LOW
        ? SOFT_LOW - (SOFT_LOW - n) * 0.45
        : n,
  )

/* --- Role and genre bias -------------------------------------------------- */

/**
 * Twenty-five titles use twenty-five role vocabularies, so a role is matched
 * to a competitive archetype by keyword rather than by a per-game table. A
 * Duelist, an Entry, a Rusher and a Gold laner all play forward for a living;
 * the model should say so without knowing which game it is looking at.
 *
 * Order matters - the first keyword that matches wins.
 */
const ROLE_ARCHETYPES = [
  {
    key: 'anchor',
    label: 'Anchor',
    keywords: ['tank', 'anchor', 'offlane', 'exp lane', 'clash lane', 'defender', 'grappler', 'beatdown'],
    bias: { aggression: 4, pressure: 8, impact: 6, consistency: 6, mechanics: -4, risk: -6 },
  },
  {
    key: 'playmaker',
    label: 'Playmaker',
    keywords: ['igl', 'jungle', 'jungler', 'initiator', 'roamer', 'mid', 'tempo', 'control', 'scout', 'zoner', 'poker'],
    bias: { decision: 12, tempo: 8, strategy: 10, adaptability: 8, aggression: 2, mechanics: -2 },
  },
  {
    key: 'carry',
    label: 'Carry',
    keywords: ['duelist', 'entry', 'fragger', 'carry', 'slayer', 'rusher', 'striker', 'damage', 'awper', 'sniper', 'gold lane', 'farm lane', 'bot', 'rushdown', 'bridge spam', 'attacking', 'mishima'],
    bias: { aggression: 14, mechanics: 12, risk: 10, tempo: 6, consistency: -8, objective: -6 },
  },
  {
    key: 'support',
    label: 'Support',
    keywords: ['support', 'sentinel', 'controller', 'objective', 'midfield', 'builder', 'saves', 'balanced', 'cycle'],
    bias: { impact: 12, objective: 12, consistency: 10, decision: 6, aggression: -10, risk: -8 },
  },
  {
    key: 'flex',
    label: 'Flex',
    keywords: ['flex', 'all-round', 'utility', 'lurker'],
    bias: { versatility: 16, adaptability: 10, strategy: 4, mechanics: -2 },
  },
]

const DEFAULT_ARCHETYPE = {
  key: 'specialist',
  label: 'Specialist',
  bias: { mechanics: 8, consistency: 6, strategy: 6, versatility: -8 },
}

export function roleArchetype(role = '') {
  const lower = role.toLowerCase()
  return ROLE_ARCHETYPES.find((a) => a.keywords.some((k) => lower.includes(k))) ?? DEFAULT_ARCHETYPE
}

/**
 * Genre shifts what competing even looks like. A fighting-game player lives on
 * mechanics and nerve with nobody to cover for them; a battle-royale roster
 * lives on positioning and patience. Without this, every scene's DNA reads the
 * same, which is the failure mode this whole model exists to avoid.
 */
const GENRE_BIAS = {
  tactical: { strategy: 8, objective: 6, coordination: 8, discipline: 6, tempo: -4 },
  moba: { objective: 10, drafting: 12, tempo: 4, coordination: 6, mechanics: -2 },
  br: { risk: 10, adaptability: 8, tempo: -6, objectives: 8, coordination: -4, aggression: -2 },
  fighting: { mechanics: 16, pressure: 10, adaptability: 6, impact: -8, coordination: -12, roleReliance: 14 },
  sports: { tempo: 8, mechanics: 6, coordination: 4, strategy: -4, drafting: -6 },
  strategy: { strategy: 14, decision: 10, drafting: 8, aggression: -6, coordination: -8 },
  hero: { aggression: 8, impact: 6, coordination: 6, objective: 6, strategy: -4 },
}

/* --- Building a profile --------------------------------------------------- */

const strengthFromRating = (rating) => Math.max(0.08, Math.min(1, (rating - 1720) / 760))

const strengthFromRecord = (record = '0-0') => {
  const [w, l] = record.split('-').map(Number)
  return w + l ? Math.max(0.08, Math.min(1, (w / (w + l)) * 1.25)) : 0.5
}

/**
 * The shared shape-builder. Strength sets the height of the profile, the two
 * bias tables tilt it, and per-dimension jitter keeps two competitors of the
 * same rating and role from sharing a silhouette - the model is meant to
 * distinguish people, so identical shapes are a bug, not a rounding detail.
 */
function buildValues({ kind, seed, strength, biases }) {
  const rand = rng(seed)
  const dims = dimensionsFor(kind)
  const base = 40 + strength * 42

  const values = {}
  for (const dim of dims) {
    const bias = biases.reduce((sum, table) => sum + (table[dim.key] ?? 0), 0)
    // A wide jitter band on purpose: a profile whose points all sit within a
    // few units of each other is a circle, and a circle says nothing.
    const jitter = (rand() - 0.5) * 34
    values[dim.key] = shape(base + bias + jitter)
  }

  // Role reliance runs the other way: a strong, deep roster depends less on
  // any one seat, so strength should pull it down rather than up.
  if (values.roleReliance !== undefined) {
    values.roleReliance = shape(88 - strength * 34 + (rand() - 0.5) * 20)
  }
  return values
}

/** Sorted strongest-first, with weak-is-good dimensions read the right way. */
export function orderedDimensions(values, kind) {
  return dimensionsFor(kind)
    .map((dim) => ({
      ...dim,
      value: values[dim.key],
      // What ranking should treat as "strong" - high, unless the dimension is
      // one where high is a liability.
      strength: INVERTED_DIMENSIONS.has(dim.key) ? 100 - values[dim.key] : values[dim.key],
    }))
    .sort((a, b) => b.strength - a.strength)
}

/* --- Naming a competitive identity ---------------------------------------- */

/**
 * The identity line is the thing a recruiter reads instead of a rank. It is
 * composed rather than picked from a list: the top dimension supplies the
 * noun, the second supplies the adjective, so twelve dimensions generate a
 * vocabulary of identities that stays specific to the actual shape.
 */
const IDENTITY_NOUN = {
  aggression: 'Aggressor', consistency: 'Metronome', adaptability: 'Adaptor', adaptation: 'Adaptor',
  pressure: 'Closer', risk: 'Gambler', impact: 'Enabler',
  decision: 'Decision-maker', objective: 'Objective Anchor', mechanics: 'Mechanic',
  tempo: 'Tempo-setter', versatility: 'Utility Player', strategy: 'Strategist',
  coordination: 'Unit', earlyGame: 'Fast Starter', lateGame: 'Long Game',
  objectives: 'Objective Team', drafting: 'Draft Team', closing: 'Closer',
  discipline: 'Disciplined Side', roleReliance: 'Star System',
}

const IDENTITY_ADJECTIVE = {
  aggression: 'Aggressive', consistency: 'Consistent', adaptability: 'Adaptive', adaptation: 'Adaptive',
  pressure: 'High-pressure', risk: 'High-variance', impact: 'High-impact',
  decision: 'Calculated', objective: 'Objective-first', mechanics: 'Mechanical',
  tempo: 'Fast-tempo', versatility: 'Flexible', strategy: 'Strategic',
  coordination: 'Coordinated', earlyGame: 'Front-loaded', lateGame: 'Late-scaling',
  objectives: 'Objective-led', drafting: 'Well-drafted', closing: 'Clinical',
  discipline: 'Disciplined', roleReliance: 'Star-led',
}

export function identityFor(values, kind) {
  const [first, second] = orderedDimensions(values, kind)
  const adjective = IDENTITY_ADJECTIVE[second.key] ?? 'Balanced'
  const noun = IDENTITY_NOUN[first.key] ?? 'Competitor'
  return `${adjective} ${noun}`
}

/**
 * The supporting lines under the identity. Written from the shape rather than
 * chosen at random, and phrased in the title's own vocabulary, so a MOBA
 * player's traits talk about the draft and a shooter's talk about site
 * control.
 */
const TRAIT_TEMPLATES = {
  aggression: (lex) => `Takes ${lex.space} rather than waiting for it`,
  consistency: () => 'Output barely moves game to game',
  adaptability: () => 'Adjusts mid-series rather than after it',
  adaptation: () => 'Comes back changed after a lost game',
  pressure: () => 'High-pressure performer',
  risk: () => 'Willing to take the high-variance line',
  impact: () => 'Lifts the players around them',
  decision: () => 'Strong mid-game decision-making',
  objective: (lex) => `Plays around ${lex.objective}`,
  mechanics: () => 'Mechanical ceiling above their tier',
  tempo: (lex, game) => `Sets the pace of a ${game.unit.toLowerCase()}`,
  versatility: () => 'Flexible role pool',
  strategy: (lex) => `Reads ${lex.plan} better than most at this level`,
  coordination: () => 'Moves as one unit through contact',
  earlyGame: (lex) => `Wins ${lex.early} more often than not`,
  lateGame: (lex) => `Strongest in ${lex.late}`,
  objectives: (lex) => `Organised around ${lex.objective}`,
  drafting: (lex) => `Generates edge in ${lex.plan}`,
  closing: () => 'Converts winning positions reliably',
  discipline: () => 'Rarely gives back a position they have won',
  roleReliance: () => 'Distributes the load across the roster',
}

const WEAKNESS_TEMPLATES = {
  aggression: (lex) => `Cedes ${lex.space} by default`,
  consistency: () => 'Swings hard between good and bad games',
  adaptability: () => 'Slow to change a plan that has stopped working',
  adaptation: () => 'Runs the same game plan back after it has been solved',
  pressure: () => 'Output drops in deciders',
  risk: () => 'Passes on the winning line when it looks risky',
  impact: () => 'Performance is largely individual',
  decision: () => 'Reads are late when the call is fast',
  objective: (lex) => `Drifts off ${lex.objective}`,
  mechanics: () => 'Execution ceiling caps the profile',
  tempo: () => 'Rarely dictates the pace',
  versatility: () => 'Narrow role pool',
  strategy: () => 'Little edge generated before the game starts',
  coordination: () => 'Falls into individual play under load',
  earlyGame: (lex) => `Concedes ${lex.early}`,
  lateGame: (lex) => `Fades in ${lex.late}`,
  objectives: (lex) => `Contests ${lex.objective} late`,
  drafting: (lex) => `Loses ground in ${lex.plan}`,
  closing: () => 'Gives winning positions back',
  discipline: () => 'Throws away won positions',
  roleReliance: () => 'Too much of the game runs through one seat',
}

export function traitsFor(values, kind, game) {
  const lex = lexiconOf(game)
  const ordered = orderedDimensions(values, kind)
  return ordered.slice(0, 3).map((dim) => (TRAIT_TEMPLATES[dim.key] ?? (() => dim.label))(lex, game))
}

export function weaknessesFor(values, kind, game) {
  const lex = lexiconOf(game)
  const ordered = orderedDimensions(values, kind)
  return ordered
    .slice(-2)
    .reverse()
    .map((dim) => (WEAKNESS_TEMPLATES[dim.key] ?? (() => dim.label))(lex, game))
}

/* --- Evolution ------------------------------------------------------------ */

const HISTORY_WINDOWS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

/**
 * How the profile got to where it is.
 *
 * Built backwards from the current shape so the last snapshot is exactly
 * today's DNA - a history that ended somewhere else would contradict every
 * other screen. Dimensions drift at different rates because they do: mechanics
 * move slowly, tempo and aggression move with a meta.
 */
const DRIFT_RATE = {
  mechanics: 0.4, consistency: 0.6, strategy: 0.9, versatility: 0.5,
  aggression: 1.3, tempo: 1.3, risk: 1.2, adaptability: 1.0, adaptation: 1.0,
  drafting: 1.4, earlyGame: 1.2, lateGame: 1.0, coordination: 0.8,
}

export function dnaHistory(id, values, kind) {
  return memo(`history:${kind}:${id}`, () => {
    const dims = dimensionsFor(kind)
    const rand = rng(seedFrom('history', kind, id))
    const steps = HISTORY_WINDOWS.length

    // Walk backwards from today, then reverse - so the newest snapshot is the
    // real one and the older ones are where it came from.
    const frames = [{ label: HISTORY_WINDOWS[steps - 1], values: { ...values } }]
    for (let step = steps - 2; step >= 0; step -= 1) {
      const previous = frames[frames.length - 1].values
      const next = {}
      for (const dim of dims) {
        const rate = DRIFT_RATE[dim.key] ?? 1
        next[dim.key] = clamp(previous[dim.key] - (rand() - 0.42) * 7 * rate)
      }
      frames.push({ label: HISTORY_WINDOWS[step], values: next })
    }
    return frames.reverse()
  })
}

/** Change since the previous window, per dimension. */
export function deltasFrom(history) {
  const latest = history[history.length - 1].values
  const previous = history[history.length - 2]?.values ?? latest
  return Object.fromEntries(
    Object.keys(latest).map((key) => [key, latest[key] - previous[key]]),
  )
}

/* --- Confidence ----------------------------------------------------------- */

/**
 * Confidence is reported, not claimed. It follows the sample the model has
 * actually seen and the coverage level of the title, so a beta scene cannot
 * present itself as settled.
 */
const COVERAGE_CEILING = { full: 96, beta: 78, planned: 52 }

function confidenceFor(gameId, sample) {
  const ceiling = COVERAGE_CEILING[coverageKeyOf(GAMES_BY_ID[gameId])] ?? 52
  const fromSample = Math.min(1, sample / 120)
  return Math.round(48 + fromSample * (ceiling - 48))
}

/* --- Public builders ------------------------------------------------------ */

/**
 * A player's Competitive DNA.
 *
 * Takes anything player-shaped that carries an id, a title, a role and a
 * rating - a ladder row, a roster member, or the signed-in player's profile
 * for one of their titles.
 */
export function playerDna(entity) {
  const id = entity.id ?? `${entity.gameId}-${entity.name ?? 'player'}`
  return memo(`player:${id}`, () => {
    const game = GAMES_BY_ID[entity.gameId]
    const archetype = roleArchetype(entity.role)
    const strength = strengthFromRating(entity.rating ?? 2000)
    const seed = seedFrom('dna', id)
    const values = buildValues({
      kind: 'player',
      seed,
      strength,
      biases: [archetype.bias, GENRE_BIAS[game.genre] ?? {}],
    })

    const rand = rng(seed ^ 0x9e3779b9)
    const sample = Math.round(24 + rand() * 210)
    const history = dnaHistory(id, values, 'player')

    return {
      kind: 'player',
      id,
      name: entity.name,
      gameId: entity.gameId,
      game,
      role: entity.role,
      archetype,
      values,
      ordered: orderedDimensions(values, 'player'),
      identity: identityFor(values, 'player'),
      traits: traitsFor(values, 'player', game),
      weaknesses: weaknessesFor(values, 'player', game),
      history,
      deltas: deltasFrom(history),
      sample,
      confidence: confidenceFor(entity.gameId, sample),
    }
  })
}

/** A team's Competitive DNA, derived from its record and its form. */
export function teamDna(team) {
  return memo(`team:${team.id}`, () => {
    const game = GAMES_BY_ID[team.gameId]
    const strength = strengthFromRecord(team.record)
    const seed = seedFrom('dna', team.id)

    // Recent form tilts the shape the way it tilts a real read on a team: a
    // side that has just won four straight is playing faster and further
    // forward than its season record alone would suggest.
    const recentWins = (team.form ?? []).filter((r) => r === 'w').length
    const formBias = {
      aggression: (recentWins - 2.5) * 3,
      tempo: (recentWins - 2.5) * 2,
      closing: (recentWins - 2.5) * 4,
      pressure: (recentWins - 2.5) * 3,
    }

    const values = buildValues({
      kind: 'team',
      seed,
      strength,
      biases: [GENRE_BIAS[game.genre] ?? {}, formBias],
    })

    const rand = rng(seed ^ 0x85ebca6b)
    const sample = Math.round(18 + rand() * 90)
    const history = dnaHistory(team.id, values, 'team')

    return {
      kind: 'team',
      id: team.id,
      name: team.name,
      gameId: team.gameId,
      game,
      team,
      values,
      ordered: orderedDimensions(values, 'team'),
      identity: identityFor(values, 'team'),
      traits: traitsFor(values, 'team', game),
      weaknesses: weaknessesFor(values, 'team', game),
      history,
      deltas: deltasFrom(history),
      sample,
      confidence: confidenceFor(team.gameId, sample),
      winCondition: winConditionFor(values, game),
      roleReliance: relianceLabel(values.roleReliance),
    }
  })
}

/**
 * What this team is actually trying to do to win, in a sentence. Read off the
 * two dimensions the shape leans hardest on, because a win condition is a
 * combination rather than a single trait.
 */
function winConditionFor(values, game) {
  const lex = lexiconOf(game)
  const [first, second] = orderedDimensions(values, 'team')
  const CLAUSES = {
    aggression: `forcing contact before ${lex.early} settles`,
    coordination: 'winning coordinated fights outright',
    tempo: `running the game faster than the opponent wants`,
    adaptation: 'out-adjusting the opponent across a series',
    adaptability: 'out-adjusting the opponent across a series',
    earlyGame: `converting ${lex.early} into an unrecoverable lead`,
    lateGame: `surviving to ${lex.late} and executing there`,
    objectives: `stacking ${lex.objective} until it compounds`,
    drafting: `winning ${lex.plan} and playing a clean game`,
    closing: 'converting every winning position without slipping',
    discipline: 'refusing to give anything back',
    pressure: 'taking the game to a decider and holding nerve',
    roleReliance: 'getting one seat fed and letting it carry',
  }
  return `${CLAUSES[first.key] ?? 'playing a clean game'}, backed by ${
    CLAUSES[second.key] ?? 'solid fundamentals'
  }`
}

const relianceLabel = (value) =>
  value >= 72
    ? { level: 'High', note: 'Most of the game runs through one seat. Shut it down and the plan stalls.' }
    : value >= 48
      ? { level: 'Moderate', note: 'A clear first option, with a second who can carry a game.' }
      : { level: 'Low', note: 'Threat is distributed. No single seat to remove.' }
