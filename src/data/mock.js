// Static mock data - this is a look-and-feel mockup, not a working backend.
//
// Everything derivable lives in generate.js, dna.js and matchup.js. What stays
// here is what belongs to the signed-in player specifically: who they are, the
// titles they compete in, the condition signals that feed the model, and the
// review material their passport shows.

import { eventsFor, teamsFor } from './generate'
import { myTeam } from './matchup'

/**
 * The signed-in player. Competitors routinely compete in more than one title
 * (and on more than one platform), so the profile is a list keyed by game
 * rather than a single hardcoded role and stat pair.
 *
 * Note what is *not* here: an identity, an archetype, a set of strengths. Those
 * are read off Competitive DNA rather than written down, because the whole
 * claim of the product is that they are derived from how someone competes.
 */
export const player = {
  firstName: 'Kiel',
  fullName: 'Kiel "Kidlat" Ramos',
  handle: 'Kidlat',
  initials: 'KR',
  hoursThisWeek: 22,
  primaryGameId: 'valorant',
  passportSince: 'March 2024',
  profiles: [
    {
      gameId: 'valorant',
      role: 'Duelist',
      tier: 'diamond',
      rating: 2410,
      region: 'NCR',
      availability: 'Evenings PHT',
      winRate: '58%',
      matchesAnalyzed: 412,
      scrimsLogged: 142,
      since: 2022,
      stats: [
        { label: 'ACS', value: 271 },
        { label: 'K/D', value: 1.34 },
      ],
    },
    {
      gameId: 'mlbb',
      role: 'Jungler',
      tier: 'platinum',
      rating: 2135,
      region: 'Cebu',
      availability: 'Late nights PHT',
      winRate: '61%',
      matchesAnalyzed: 188,
      scrimsLogged: 88,
      since: 2023,
      stats: [
        { label: 'KDA', value: 4.12 },
        { label: 'Gold/min', value: 812 },
      ],
    },
    {
      gameId: 'cs2',
      role: 'Entry',
      tier: 'gold',
      rating: 1904,
      region: 'Pampanga',
      availability: 'Weekends PHT',
      winRate: '52%',
      matchesAnalyzed: 96,
      scrimsLogged: 37,
      since: 2024,
      stats: [
        { label: 'ADR', value: 78 },
        { label: 'Rating', value: 1.08 },
      ],
    },
  ],
}

export const profileFor = (gameId) =>
  player.profiles.find((p) => p.gameId === gameId) ??
  player.profiles.find((p) => p.gameId === player.primaryGameId)

/**
 * Verified competitive achievements, built from the title's own circuit so a
 * passport never claims a tournament that does not exist elsewhere in the app.
 * "Verified" is the point: a passport is only worth reading if the record on
 * it was checked against a result.
 */
export function achievementsFor(gameId) {
  const events = eventsFor(gameId)
  return [
    { id: 'a1', placement: '2nd', event: events[0].name, season: 2025, verified: true },
    { id: 'a2', placement: 'Top 4', event: events[1].name, season: 2025, verified: true },
    { id: 'a3', placement: '1st', event: events[2].name, season: 2024, verified: true },
    { id: 'a4', placement: 'Top 8', event: events[3].name, season: 2024, verified: false },
  ]
}

/** Where the player has actually played, most recent first. */
export function teamHistoryFor(gameId) {
  const teams = teamsFor(gameId)
  const current = myTeam(gameId)
  return [
    { id: 'th1', team: current.name, role: profileFor(gameId).role, from: 2024, to: null },
    { id: 'th2', team: teams[5].name, role: profileFor(gameId).role, from: 2023, to: 2024 },
    { id: 'th3', team: teams[7].name, role: 'Academy', from: 2022, to: 2023 },
  ]
}

/**
 * Condition signals.
 *
 * Deliberately secondary. Readiness was the headline number of the previous
 * product; here it is an input the model uses to explain variance in the
 * consistency and pressure dimensions, and no screen leads with it. It answers
 * "why did this week read low", not "how good are you".
 */
export const readiness = {
  score: 82,
  trend: [64, 68, 71, 70, 76, 79, 82],
  reason: 'Sleep ok, load high',
  direction: 'up',
  // Which DNA dimension each signal is being used to explain.
  factors: [
    { label: 'Sleep', value: '7h 20m', state: 'ok', explains: 'consistency' },
    { label: 'Practice load', value: '22h / wk', state: 'warn', explains: 'mechanics' },
    { label: 'Match stress', value: 'Moderate', state: 'ok', explains: 'pressure' },
  ],
}

/**
 * A VOD under review. `source` says who put each marker there: the model
 * flagged it, or the player did. Showing both in one timeline is the honest
 * version of "AI VOD analysis" - the system proposes, the player confirms.
 */
export const vod = {
  recorded: 'Mar 14',
  durationLabel: '28:10',
  durationSeconds: 1690,
  positionSeconds: 765,
  tags: [
    { id: 't1', at: 372, label: 'Rotation late — B site', source: 'model', dimension: 'decision' },
    { id: 't2', at: 843, label: 'Good trade, follow-up slow', source: 'model', dimension: 'coordination' },
    { id: 't3', at: 1129, label: 'Early aggression punished', source: 'model', dimension: 'risk' },
    { id: 't4', at: 1360, label: 'Econ mismanagement', source: 'you', dimension: null },
  ],
}


export const wellness = {
  week: [
    { day: 'Mon', sleep: 7.5, load: 3, score: 76 },
    { day: 'Tue', sleep: 6.2, load: 4, score: 70 },
    { day: 'Wed', sleep: 7.8, load: 3, score: 79 },
    { day: 'Thu', sleep: 8.1, load: 2, score: 84 },
    { day: 'Fri', sleep: 6.9, load: 5, score: 71 },
    { day: 'Sat', sleep: 7.4, load: 4, score: 79 },
    { day: 'Sun', sleep: 7.3, load: 4, score: 82 },
  ],
}

export const highlightVods = [
  // Deliberately title-neutral: this reel sits on every game's passport tab.
  { id: 'h1', label: 'Late-game teamfight', length: '0:42', dimension: 'pressure' },
  { id: 'h2', label: 'Opening picks reel', length: '1:18', dimension: 'aggression' },
  { id: 'h3', label: 'Playoffs clutch', length: '0:55', dimension: 'pressure' },
]

/**
 * The signed-in player as a DNA-shaped entity for one of their titles.
 *
 * `playerDna` takes anything carrying an id, a title, a role and a rating, so
 * the signed-in player goes through exactly the same model as every ladder row
 * rather than getting a special case. Their profile on their own passport is
 * therefore computed the same way an org sees it.
 */
export const playerEntityFor = (gameId) => {
  const profile = profileFor(gameId)
  return {
    id: `me-${profile.gameId}`,
    gameId: profile.gameId,
    name: player.handle,
    role: profile.role,
    rating: profile.rating,
  }
}
