/**
 * Talent Intelligence - recruitment as a compatibility question.
 *
 * A conventional search asks for players with a high rank, which returns the
 * same twenty names to every org and tells none of them whether those players
 * would actually fit. Outplay asks the question a coach actually has:
 *
 *     Which players complement our team's Competitive DNA?
 *
 * That needs two things this file provides. `rosterGapsFor` reads a team's own
 * profile and names what it is missing. `fitFor` scores a player against those
 * gaps rather than against the ladder, so a Gold-tier support who fills the
 * exact hole in a roster outranks a Diamond duelist who duplicates its
 * strongest seat.
 *
 * The bridge between the two models is `NEED_SOURCES`: player dimensions and
 * team dimensions are different vocabularies, and a recruitment claim is only
 * as good as the mapping between them, so that mapping is written down and
 * explained rather than implied.
 */
import { GAMES_BY_ID } from './games'
import { playersFor } from './generate'
import { INVERTED_DIMENSIONS, TEAM_DIMENSIONS, playerDna, roleArchetype, teamDna } from './dna'

const cache = new Map()
const memo = (key, build) => {
  if (!cache.has(key)) cache.set(key, build())
  return cache.get(key)
}

/**
 * Which player dimension supplies which team dimension.
 *
 * A team is not the average of its players, but each team-level property does
 * have a player-level source: a side's discipline comes from consistent
 * individuals, its coordination from players who lift the people around them,
 * its drafting edge from players who prepare. `inverted` marks the one case
 * where more of the player trait means less of the team problem - role range
 * is what reduces role reliance.
 */
const NEED_SOURCES = {
  aggression: { from: 'aggression', why: 'players who take the first contact' },
  coordination: { from: 'impact', why: 'players who lift the people around them' },
  tempo: { from: 'tempo', why: 'a player who dictates pace' },
  adaptation: { from: 'adaptability', why: 'players who adjust mid-series' },
  earlyGame: { from: 'risk', why: 'a player willing to take the early line' },
  lateGame: { from: 'mechanics', why: 'execution that holds up under load' },
  objectives: { from: 'objective', why: 'a player who plays around the objective' },
  drafting: { from: 'strategy', why: 'a player who generates edge before the game' },
  closing: { from: 'decision', why: 'decision quality in closing positions' },
  discipline: { from: 'consistency', why: 'output that does not swing' },
  pressure: { from: 'pressure', why: 'someone who raises in a decider' },
  roleReliance: { from: 'versatility', why: 'a flexible seat, to spread the load', inverted: true },
}

const teamDimension = Object.fromEntries(TEAM_DIMENSIONS.map((d) => [d.key, d]))

/**
 * What a roster is missing, worst first.
 *
 * Read off the team's own DNA rather than from a wishlist, so the needs are
 * consistent with everything else the platform says about that team.
 */
export function rosterGapsFor(team) {
  return memo(`gaps:${team.id}`, () => {
    const dna = teamDna(team)
    const game = GAMES_BY_ID[team.gameId]

    const ranked = TEAM_DIMENSIONS.map((dim) => ({
      ...dim,
      value: dna.values[dim.key],
      // Role reliance is a problem when it is high, everything else when low.
      severity: INVERTED_DIMENSIONS.has(dim.key) ? dna.values[dim.key] : 100 - dna.values[dim.key],
    })).sort((a, b) => b.severity - a.severity)

    const needs = ranked.slice(0, 3).map((dim) => ({
      key: dim.key,
      label: dim.label,
      value: dim.value,
      severity: Math.round(dim.severity),
      source: NEED_SOURCES[dim.key],
      // The gap stated as a recruitment brief, not as a metric.
      brief: `Needs ${NEED_SOURCES[dim.key]?.why ?? dim.label.toLowerCase()}`,
    }))

    // Which roles the roster is thin on: any role in the title's vocabulary
    // that nobody on the ladder currently covers for this team.
    const covered = new Set(
      playersFor(team.gameId).filter((p) => p.team === team.name).map((p) => p.role),
    )
    const openRoles = game.roles.filter((role) => !covered.has(role))

    return {
      team,
      dna,
      needs,
      strengths: ranked.slice(-2).reverse().map((d) => ({ key: d.key, label: d.label, value: d.value })),
      openRoles,
    }
  })
}

/* --- Compatibility -------------------------------------------------------- */

// Bands are calibrated to the drift the history model actually produces
// (roughly -6 to +6 across the tracked window). Wider bands than that would
// label every profile "Steady" and the readout would carry no information.
const TRAJECTORY_BANDS = [
  { min: 5, label: 'Rising fast', tone: 'edge', note: 'Profile has moved sharply upward over two splits.' },
  { min: 1.5, label: 'Improving', tone: 'edge', note: 'Steady upward drift across the tracked window.' },
  { min: -1.5, label: 'Steady', tone: 'muted', note: 'Profile is stable. What you see is what you get.' },
  { min: -5, label: 'Cooling', tone: 'ember', note: 'Several dimensions have slipped since the last split.' },
  { min: -Infinity, label: 'Declining', tone: 'ember', note: 'Consistent decline across the tracked window.' },
]

/** Where a profile is heading, read from its own history rather than asserted. */
export function trajectoryFor(dna) {
  const first = dna.history[0].values
  const last = dna.history[dna.history.length - 1].values
  const keys = Object.keys(last)
  const drift = keys.reduce((sum, key) => sum + (last[key] - first[key]), 0) / keys.length
  const band = TRAJECTORY_BANDS.find((b) => drift >= b.min)
  return { ...band, drift: Math.round(drift * 10) / 10 }
}

/**
 * How well one player fits one roster.
 *
 * Three parts, weighted the way a coach weights them: does this player fill
 * what the team is actually missing, does their style sit alongside the team's
 * without duplicating it, and does the role they play leave a seat open. The
 * score is a summary of those three - the reasons underneath it are the part
 * that is meant to be read.
 */
export function fitFor(player, team) {
  return memo(`fit:${player.id}:${team.id}`, () => {
    const pDna = playerDna(player)
    const gaps = rosterGapsFor(team)
    const reasons = []
    const concerns = []

    // 1. Does this player fill the gaps? This is most of the score, because it
    //    is the only part that is about this roster rather than about the
    //    player in the abstract.
    let needScore = 0
    for (const need of gaps.needs) {
      const source = need.source
      if (!source) continue
      const raw = pDna.values[source.from] ?? 50
      const contribution = source.inverted ? raw : raw
      needScore += contribution
      if (contribution >= 68) {
        reasons.push({
          key: need.key,
          text: `Fills the roster's ${need.label.toLowerCase()} gap — ${need.source.why} (${Math.round(contribution)}).`,
        })
      } else if (contribution <= 42) {
        concerns.push({
          key: need.key,
          text: `Does not address ${need.label.toLowerCase()}, the roster's biggest gap.`,
        })
      }
    }
    needScore = needScore / Math.max(1, gaps.needs.length)

    // 2. Style fit: a roster does not want a second copy of what it already
    //    has. Complementing the team's strongest dimension scores better than
    //    matching it.
    const teamTop = gaps.dna.ordered[0]
    const mirrorKey = Object.entries(NEED_SOURCES).find(([key]) => key === teamTop.key)?.[1]?.from
    const duplication = mirrorKey ? pDna.values[mirrorKey] ?? 50 : 50
    const styleScore = 100 - Math.abs(duplication - 55) * 0.6
    if (duplication >= 78) {
      concerns.push({
        key: 'duplication',
        text: `Doubles up on ${teamTop.label.toLowerCase()}, already the roster's strongest trait.`,
      })
    }

    // 3. Role fit: an open seat is worth more than a contested one.
    const openRole = gaps.openRoles.includes(player.role)
    const roleScore = openRole ? 92 : 62
    if (openRole) {
      // Leads the list: an open seat is the first thing a coach checks, and
      // the reasons are trimmed to three below.
      reasons.unshift({ key: 'role', text: `${player.role} is an open seat on this roster.` })
    } else {
      concerns.push({ key: 'role', text: `${player.role} is already covered. Would compete for the seat.` })
    }

    const score = Math.round(needScore * 0.55 + styleScore * 0.25 + roleScore * 0.2)
    const trajectory = trajectoryFor(pDna)

    return {
      player,
      dna: pDna,
      team,
      score: Math.max(24, Math.min(97, score)),
      needScore: Math.round(needScore),
      styleScore: Math.round(styleScore),
      roleScore,
      openRole,
      archetype: roleArchetype(player.role),
      trajectory,
      reasons: reasons.slice(0, 3),
      concerns: concerns.slice(0, 2),
    }
  })
}

/**
 * Candidates for a roster, best fit first.
 *
 * Deliberately not sorted by rating: the whole claim of this screen is that
 * the best available player and the right player are different questions.
 */
export function candidatesFor(team, { limit = 8 } = {}) {
  return memo(`candidates:${team.id}:${limit}`, () =>
    playersFor(team.gameId)
      .filter((p) => p.team !== team.name)
      .map((p) => fitFor(p, team))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit),
  )
}

/**
 * Players whose profile is climbing faster than their rating implies - the
 * ones an org wants to reach before the ladder catches up.
 */
export function emergingFor(gameId, { limit = 4 } = {}) {
  return memo(`emerging:${gameId}:${limit}`, () =>
    playersFor(gameId)
      .map((p) => ({ player: p, dna: playerDna(p), trajectory: trajectoryFor(playerDna(p)) }))
      .filter((row) => row.trajectory.drift > 0)
      .sort((a, b) => b.trajectory.drift - a.trajectory.drift)
      .slice(0, limit),
  )
}
