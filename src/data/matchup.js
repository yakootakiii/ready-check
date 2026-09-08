/**
 * Matchup Intelligence - the flagship of the product.
 *
 * Everywhere else in esports asks "how good is this team". Outplay asks a
 * different question, and this file is where it gets answered:
 *
 *     How does your style interact with theirs?
 *
 * A matchup is therefore never a comparison of two ratings. It is a
 * dimension-by-dimension read of two Competitive DNA profiles, turned into
 * language a player can act on before the game and checked against what
 * actually happened after it.
 *
 * The loop this file implements:
 *
 *     PLAY -> ANALYZE -> UNDERSTAND -> ADAPT -> OUTPLAY
 *
 * `matchupFor` is the forward half: two profiles in, edges, concerns, expected
 * tempo and prep focus out. `debriefFor` is the return half: what the model
 * predicted against what the opponent actually did, and the tendency the
 * system learned from the gap. That gap is the product - a platform that only
 * predicted would be a novelty, and one that only reported would be a
 * scoreboard.
 *
 * Insight prose is composed from the dimension that produced it, in the
 * title's own vocabulary (see GENRE_LEXICON), so nothing here reads as a
 * generic chatbot paragraph bolted onto a stat table.
 */
import { GAMES_BY_ID, lexiconOf } from './games'
import { teamsFor } from './generate'
import { INVERTED_DIMENSIONS, TEAM_DIMENSIONS, teamDna } from './dna'

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

/* --- Who "you" are -------------------------------------------------------- */

/**
 * The signed-in player's team in a given title.
 *
 * Third in the table on purpose. The top seed would make every matchup
 * favourable and every insight congratulatory, which teaches the reader
 * nothing about what the screen is for; a mid-table side has real edges and
 * real problems, which is the state most users are actually in.
 */
export const MY_TEAM_INDEX = 2

export const myTeam = (gameId) => teamsFor(gameId)[MY_TEAM_INDEX]

export const myDna = (gameId) => teamDna(myTeam(gameId))

/* --- How a style interacts with other styles ------------------------------ */

/**
 * What being strong or weak in a dimension means for the *kind of opponent*
 * you handle well. This table is what lets the system say "you struggle
 * against early aggression" instead of "your early game is 54".
 */
const STYLE_INTERACTION = {
  aggression: { strong: 'passive sides that wait for a read', weak: 'teams that take the first contact' },
  coordination: { strong: 'loose rosters that fight as individuals', weak: 'tightly structured sides' },
  tempo: { strong: 'teams that want a slow, controlled game', weak: 'high-tempo sides that never let a game settle' },
  adaptation: { strong: 'one-plan teams', weak: 'sides that adjust between games' },
  earlyGame: { strong: 'teams that need time to set up', weak: 'early aggression' },
  lateGame: { strong: 'slower, objective-focused teams', weak: 'sides that close a game before it matures' },
  objectives: { strong: 'fight-first teams that ignore the map', weak: 'objective-disciplined sides' },
  drafting: { strong: 'predictable pools', weak: 'teams that win the plan before the game' },
  closing: { strong: 'sides that give leads back', weak: 'clinical closers' },
  discipline: { strong: 'chaotic, high-risk teams', weak: 'sides that punish every mistake' },
  pressure: { strong: 'teams that fold in deciders', weak: 'sides that raise in deciders' },
  roleReliance: { strong: 'opponents built to shut one player down', weak: 'teams that target your first option' },
}

/** The tendency a high value in a dimension actually shows up as. */
const TENDENCY = {
  aggression: (lex) => `takes ${lex.space} early and forces contact`,
  coordination: () => 'moves as one unit through every fight',
  tempo: () => 'plays fast and refuses to let a game settle',
  adaptation: () => 'changes plan between games of a series',
  earlyGame: (lex) => `wins ${lex.early} and snowballs it`,
  lateGame: (lex) => `is strongest in ${lex.late}`,
  objectives: (lex) => `organises everything around ${lex.objective}`,
  drafting: (lex) => `generates its edge in ${lex.plan}`,
  closing: () => 'converts winning positions without slipping',
  discipline: () => 'gives away almost nothing',
  pressure: () => 'raises its level in deciders',
  roleReliance: () => 'funnels the game through one seat',
}

/** The tendency a low value shows up as - what there is to exploit. */
const EXPLOIT = {
  aggression: (lex) => `cedes ${lex.space} by default, so it can be taken for free`,
  coordination: () => 'breaks into individual play once a fight goes wrong',
  tempo: () => 'is uncomfortable when the game runs faster than it wants',
  adaptation: () => 'runs the same plan back after it has been solved',
  earlyGame: (lex) => `concedes ${lex.early} and plays from behind`,
  lateGame: (lex) => `fades once the game reaches ${lex.late}`,
  objectives: (lex) => `contests ${lex.objective} late, after the value is gone`,
  drafting: (lex) => `can be out-prepared in ${lex.plan}`,
  closing: () => 'gives winning positions back',
  discipline: () => 'donates positions it had already won',
  pressure: () => 'drops a level when the game becomes a decider',
  roleReliance: () => 'has no second option when the first is removed',
}

/** What to actually do about a dimension you are behind in. */
const PREP_ACTION = {
  aggression: (lex) => `Rehearse a default that survives first contact without giving up ${lex.space}.`,
  coordination: () => 'Cut the number of calls. Structure beats improvisation against this side.',
  tempo: (lex, game) => `Practise slowing the ${game.unit.toLowerCase()} down and forcing them to make the first move.`,
  adaptation: () => 'Prepare a second plan before the series, not between games of it.',
  earlyGame: (lex) => `Drill ${lex.early}. Reaching the mid-game level is the whole task.`,
  lateGame: (lex) => `Close before ${lex.late}. Do not let this one run long.`,
  objectives: (lex) => `Set a hard rule for when ${lex.objective} is worth a fight and when it is not.`,
  drafting: (lex) => `Spend the prep in ${lex.plan}. This is where the game is being lost.`,
  closing: () => 'Rehearse the last two minutes of a won position until it is boring.',
  discipline: () => 'Cut the low-percentage plays. This side converts every one you miss.',
  pressure: () => 'Play the decider before the decider - scrim only closing scenarios this week.',
  roleReliance: () => 'Build a second win condition. One seat is being watched.',
}

const dimensionLabel = Object.fromEntries(TEAM_DIMENSIONS.map((d) => [d.key, d.label]))

/**
 * Reading direction. In most dimensions the higher number is the better one;
 * in role reliance it is the worse one, so an unguarded subtraction would tell
 * a team its biggest fragility was an advantage.
 */
const advantageOf = (key, mine, theirs) =>
  INVERTED_DIMENSIONS.has(key) ? theirs - mine : mine - theirs

/** What kind of opponent your shape handles, and what it does not. */
export function styleProfile(dna) {
  const strong = dna.ordered[0]
  const weak = dna.ordered[dna.ordered.length - 1]
  return {
    beats: STYLE_INTERACTION[strong.key]?.strong ?? 'sides without a clear plan',
    struggles: STYLE_INTERACTION[weak.key]?.weak ?? 'well-rounded opposition',
    strongKey: strong.key,
    weakKey: weak.key,
  }
}

const tempoRead = (value, game) =>
  value >= 72
    ? { label: 'Fast', note: `Expect them to try to end a ${game.unit.toLowerCase()} early.` }
    : value >= 46
      ? { label: 'Measured', note: `They will take the ${game.unit.toLowerCase()} at whatever pace suits the scoreline.` }
      : { label: 'Slow', note: `They want a long ${game.unit.toLowerCase()} and will trade time for certainty.` }

/* --- The forward half: analysing a matchup -------------------------------- */

/**
 * A full read of one matchup.
 *
 * `mine` and `theirs` are team DNA profiles. Everything below is derived from
 * the pair - there is no separate "matchup data" anywhere, because the whole
 * claim of the product is that the matchup falls out of the two models.
 */
export function matchupFor(mine, theirs) {
  return memo(`matchup:${mine.id}:${theirs.id}`, () => {
    const game = GAMES_BY_ID[theirs.gameId]
    const lex = lexiconOf(game)

    const dimensions = TEAM_DIMENSIONS.map((dim) => {
      const you = mine.values[dim.key]
      const them = theirs.values[dim.key]
      const advantage = advantageOf(dim.key, you, them)
      return {
        key: dim.key,
        label: dim.label,
        short: dim.short,
        blurb: dim.blurb,
        you,
        them,
        advantage,
        // A six-point gap is inside the noise of the model; calling it an edge
        // would put a recommendation on top of a rounding error.
        favour: advantage > 6 ? 'you' : advantage < -6 ? 'them' : 'even',
      }
    })

    const byAdvantage = [...dimensions].sort((a, b) => b.advantage - a.advantage)
    const edges = byAdvantage.filter((d) => d.favour === 'you').slice(0, 3)
    const concerns = [...byAdvantage].reverse().filter((d) => d.favour === 'them').slice(0, 3)
    const primaryEdge = edges[0] ?? null
    const primaryConcern = concerns[0] ?? null

    const theirTop = theirs.ordered.slice(0, 2)
    const theirWeak = theirs.ordered.slice(-2).reverse()
    const style = styleProfile(mine)

    // The overall projection is deliberately shallow: a sum of advantages,
    // squashed. A matchup model that produced a confident number from twelve
    // noisy dimensions would be overselling itself, and the screen says so.
    const net = dimensions.reduce((sum, d) => sum + d.advantage, 0) / dimensions.length
    const winPct = Math.round(Math.max(18, Math.min(82, 50 + net * 1.5)))
    const confidence = Math.round((mine.confidence + theirs.confidence) / 2)

    return {
      id: `${mine.id}-vs-${theirs.id}`,
      mine,
      theirs,
      game,
      dimensions,
      edges,
      concerns,
      primaryEdge,
      primaryConcern,
      even: dimensions.filter((d) => d.favour === 'even'),

      style,
      styleClash: `Your side performs better against ${style.beats}, and struggles against ${style.struggles}.`,

      theirStrengths: theirTop.map((dim) => ({
        key: dim.key,
        label: dim.label,
        value: dim.value,
        text: `${theirs.name} ${(TENDENCY[dim.key] ?? (() => dim.label.toLowerCase()))(lex, game)}`,
      })),
      theirExploitable: theirWeak.map((dim) => ({
        key: dim.key,
        label: dim.label,
        value: dim.value,
        text: `${theirs.name} ${(EXPLOIT[dim.key] ?? (() => dim.label.toLowerCase()))(lex, game)}`,
      })),

      expectedTempo: tempoRead(theirs.values.tempo, game),
      theirWinCondition: theirs.winCondition,
      roleReliance: theirs.roleReliance,

      prepFocus: concerns.map((dim) => ({
        key: dim.key,
        title: dim.label,
        gap: Math.abs(Math.round(dim.advantage)),
        action: (PREP_ACTION[dim.key] ?? (() => `Work on ${dim.label.toLowerCase()}.`))(lex, game),
      })),

      projection: {
        winPct,
        confidence,
        // Confidence widens the band rather than moving the estimate - the
        // honest way to show a model that is unsure is a wider range, not a
        // different number.
        band: Math.round(6 + (100 - confidence) * 0.35),
      },

      /**
       * The paragraph a player reads first. Structured the way a coach would
       * say it: what kind of team you are, what kind they are, the one thing
       * to worry about, the one thing to lean on.
       */
      headline: [
        `Your team performs significantly better against ${style.beats} but struggles against ${style.struggles}.`,
        `${theirs.name} ${(TENDENCY[theirTop[0].key] ?? (() => theirTop[0].label.toLowerCase()))(lex, game)}.`,
      ],
    }
  })
}

/* --- Fixtures ------------------------------------------------------------- */

const EVENT_KINDS = ['Playoffs round 2', 'Group stage', 'Qualifier', 'Ladder fixture', 'Scrim block']

/** Opponents your team has not played yet, nearest fixture first. */
export function upcomingFor(gameId) {
  return memo(`upcoming:${gameId}`, () => {
    const game = GAMES_BY_ID[gameId]
    const rand = rng(seedFrom('upcoming', gameId))
    const mine = myDna(gameId)
    const pool = teamsFor(gameId).filter((_, i) => i !== MY_TEAM_INDEX)

    return pool.slice(0, 4).map((team, i) => {
      const theirs = teamDna(team)
      return {
        id: `${gameId}-fx${i}`,
        gameId,
        opponent: team,
        dna: theirs,
        matchup: matchupFor(mine, theirs),
        kind: EVENT_KINDS[i % EVENT_KINDS.length],
        format: game.teamSize === 1 ? 'FT5' : 'Bo3',
        // The first fixture is tonight; the rest spread across the week.
        startsInSeconds: Math.round((0.45 + i * 1.6 + rand() * 0.7) * 86400),
        venue: i === 0 ? 'Online' : ['Pasay', 'Quezon City', 'Cebu City', 'Online'][i % 4],
      }
    })
  })
}

export const nextFixture = (gameId) => upcomingFor(gameId)[0]

/* --- The return half: what actually happened ------------------------------ */

/**
 * How the opponent's real behaviour differed from the model's expectation.
 *
 * `verdict` is the useful field: `confirmed` means the model was right and
 * nothing is learned, `shifted` means it was directionally right but wrong on
 * degree, and `surprise` means the opponent did something the profile did not
 * contain - which is the only case that should change the model much.
 */
function observationsFor(matchup, rand) {
  const { theirs, game } = matchup
  const lex = lexiconOf(game)

  // Read the dimensions the opponent is actually defined by, plus one the
  // model was least sure about - that is where a surprise is likely to live.
  const watched = [...theirs.ordered.slice(0, 2), theirs.ordered[6], theirs.ordered[10]]

  return watched.map((dim, i) => {
    const predicted = dim.value
    const swing = Math.round((rand() - 0.45) * 46)
    const actual = Math.max(12, Math.min(98, predicted + swing))
    const gap = actual - predicted
    const verdict = Math.abs(gap) <= 8 ? 'confirmed' : Math.abs(gap) <= 20 ? 'shifted' : 'surprise'

    const tendency = (TENDENCY[dim.key] ?? (() => dim.label.toLowerCase()))(lex, game)
    const exploit = (EXPLOIT[dim.key] ?? (() => dim.label.toLowerCase()))(lex, game)

    return {
      id: `${matchup.id}-obs${i}`,
      key: dim.key,
      label: dim.label,
      predicted,
      actual,
      gap,
      verdict,
      expectation: `Expected: ${theirs.name} ${tendency}.`,
      reality:
        verdict === 'confirmed'
          ? `Actual: as modelled — ${tendency}, within the range the profile predicted.`
          : gap > 0
            ? `Actual: they went further than modelled — ${tendency}, and earlier than the profile suggested.`
            : `Actual: they held back — ${exploit}, at least until the game had a shape.`,
    }
  })
}

/**
 * The tendency the system learned from the gap.
 *
 * Always conditional rather than absolute, because that is what a behavioural
 * model actually recovers from one match: not "they are aggressive" but "their
 * aggression is conditional on holding an objective lead".
 */
function discoveryFrom(observations, matchup, rand) {
  const surprise =
    observations.find((o) => o.verdict === 'surprise') ??
    [...observations].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))[0]

  const lex = lexiconOf(matchup.game)
  const conditions = [
    `holding a lead in ${lex.objective}`,
    `winning ${lex.early}`,
    'being ahead on the scoreline',
    `reaching ${lex.late} level`,
    `their first option getting going`,
  ]
  const condition = conditions[Math.floor(rand() * conditions.length)]

  return {
    key: surprise.key,
    text: `${matchup.theirs.name}'s ${surprise.label.toLowerCase()} is conditional on ${condition}, not a constant.`,
    effect:
      surprise.gap >= 0
        ? `Their ${surprise.label.toLowerCase()} rating moves up ${Math.abs(Math.round(surprise.gap / 3))} once that condition is met.`
        : `Their ${surprise.label.toLowerCase()} rating drops ${Math.abs(Math.round(surprise.gap / 3))} until that condition is met.`,
  }
}

const ADAPTATIONS = [
  (lex) => `Switched the default after the second ${lex.objective} and it held.`,
  () => 'Called the mid-game timeout early rather than saving it.',
  (lex) => `Stopped contesting ${lex.early} and played for the mid-game instead.`,
  (lex) => `Traded ${lex.space} for map information and won the next three rounds off it.`,
]

const MISTAKES = [
  (lex) => `Contested ${lex.objective} twice without the numbers.`,
  () => 'Gave up a won position by taking the low-percentage line.',
  (lex) => `Ran the same ${lex.plan} back after it had already been read.`,
  () => 'Let the scoreline dictate the pace instead of the plan.',
]

/**
 * The post-match debrief: prediction against reality, plus what the model
 * learned. This is the step that makes the platform improve rather than
 * merely report.
 */
export function debriefFor(match) {
  return memo(`debrief:${match.id}`, () => {
    const rand = rng(seedFrom('debrief', match.id))
    const { matchup } = match
    const lex = lexiconOf(matchup.game)

    const observations = observationsFor(matchup, rand)
    const discovery = discoveryFrom(observations, matchup, rand)
    // A directionally-right-but-wrong-on-degree read is half a hit, not a
    // whole one. Scoring `shifted` as correct would let the model report a
    // perfect week in which it mis-sized every call it made.
    const WEIGHT = { confirmed: 1, shifted: 0.5, surprise: 0 }
    const accuracy = Math.round(
      (observations.reduce((sum, o) => sum + WEIGHT[o.verdict], 0) / observations.length) * 100,
    )

    return {
      id: `${match.id}-debrief`,
      match,
      observations,
      discovery,
      accuracy,
      adaptations: [ADAPTATIONS[Math.floor(rand() * ADAPTATIONS.length)](lex)],
      mistakes: [MISTAKES[Math.floor(rand() * MISTAKES.length)](lex)],
      // What this one match did to your own profile. Small on purpose: a model
      // that swung several points per game would be fitting noise.
      modelUpdate: matchup.mine.ordered.slice(0, 2).map((dim) => ({
        key: dim.key,
        label: dim.label,
        delta: Math.round((rand() - 0.4) * 6),
      })),
    }
  })
}

/** Your team's recent results, each carrying the debrief for that match. */
export function recentMatchesFor(gameId) {
  return memo(`recent:${gameId}`, () => {
    const game = GAMES_BY_ID[gameId]
    const rand = rng(seedFrom('recent', gameId))
    const mine = myDna(gameId)
    const pool = teamsFor(gameId).filter((_, i) => i !== MY_TEAM_INDEX)
    const best = game.teamSize === 1 ? 3 : 2
    const days = ['2 days ago', '5 days ago', '1 week ago', '9 days ago', '2 weeks ago']

    const matches = pool.slice(2, 7).map((team, i) => {
      const theirs = teamDna(team)
      const matchup = matchupFor(mine, theirs)
      const won = rand() < matchup.projection.winPct / 100
      return {
        id: `${gameId}-rm${i}`,
        gameId,
        opponent: team,
        dna: theirs,
        matchup,
        won,
        score: won ? [best, Math.floor(rand() * best)] : [Math.floor(rand() * best), best],
        played: days[i % days.length],
        kind: EVENT_KINDS[(i + 1) % EVENT_KINDS.length],
      }
    })

    // The debrief is attached rather than fetched, so a list row and a detail
    // view can never disagree about what the model said.
    return matches.map((match) => ({ ...match, debrief: debriefFor(match) }))
  })
}

/**
 * Model accuracy over the recent run - the number that says whether the
 * intelligence is worth trusting. Shown next to predictions rather than
 * buried, because a prediction without a track record is a guess.
 */
export function modelAccuracyFor(gameId) {
  return memo(`accuracy:${gameId}`, () => {
    const matches = recentMatchesFor(gameId)
    const called = matches.filter(
      (m) => (m.matchup.projection.winPct >= 50) === m.won,
    ).length
    return {
      matches: matches.length,
      called,
      pct: Math.round((called / matches.length) * 100),
      behavioural: Math.round(
        matches.reduce((sum, m) => sum + m.debrief.accuracy, 0) / matches.length,
      ),
      discoveries: matches.length,
    }
  })
}

/* --- Sparring ------------------------------------------------------------- */

/**
 * How alike two teams are, as a mean absolute difference across the twelve
 * dimensions. Lower is more similar.
 */
export function styleDistance(a, b) {
  const keys = TEAM_DIMENSIONS.map((dim) => dim.key)
  const total = keys.reduce((sum, key) => sum + Math.abs(a.values[key] - b.values[key]), 0)
  return total / keys.length
}

/**
 * Which of the sides offering scrims actually play like your next opponent.
 *
 * This is the practical use of having a style model at all: a scrim against a
 * team whose shape resembles the one you are about to face is worth several
 * against sides that play nothing like them, and no amount of rank filtering
 * will find it. Similarity is reported as a percentage with the distance it
 * came from, so a low number reads as "not much like them" rather than as a
 * quality judgement about the team.
 */
export function sparringLikeness(gameId, teamName) {
  return memo(`sparring:${gameId}:${teamName}`, () => {
    const target = nextFixture(gameId)
    const team = teamsFor(gameId).find((t) => t.name === teamName)
    if (!team || team.id === target.opponent.id) return null

    const distance = styleDistance(teamDna(team), target.dna)
    // A mean gap of 30 points across twelve dimensions is about as different as
    // two teams in one scene get, so that is where the scale bottoms out.
    const similarity = Math.max(0, Math.round(100 - (distance / 30) * 100))
    return { team, target: target.opponent, distance: Math.round(distance), similarity }
  })
}
