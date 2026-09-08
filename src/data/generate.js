/**
 * Deterministic mock data, generated per title.
 *
 * Hand-writing rosters, ladders, brackets and schedules for 25 games would be
 * thousands of lines nobody maintains, so every list here is derived from a
 * seed built out of the game id. Same game, same rows, every render - which
 * matters, because a hub whose leaderboard reshuffles on navigation reads as
 * broken rather than live.
 *
 * All org and player names are fictional. Only the game titles are real.
 */
import { GAMES, GAMES_BY_ID } from './games'
import { formatPrize } from '../format'

const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond']

// Orgs recur across titles on purpose - a real org fields teams in several
// games, and seeing the same name in two scenes is a feature of the hub.
const ORGS = [
  'Bakunawa', 'Sarimanok Esports', 'Tikbalang', 'Diwata Gaming', 'Kidlat Esports',
  'Habagat', 'Lawin Collective', 'Kalasag', 'Mandirigma', 'Ningas Esports',
  'Panday Gaming', 'Dagitab', 'Sinag Collective', 'Bagwis', 'Kawayan Esports',
  'Yakal Gaming', 'Banahaw', 'Alon Esports', 'Dalisay', 'Himig Collective',
  'Sagisag', 'Baybayin Gaming', 'Balete', 'Marikit', 'Tarsier Esports',
  'Agila Collective', 'Buwaya Gaming', 'Anahaw', 'Narra Esports', 'Talahib',
  'Batibot', 'Kalinaw Gaming',
]

const HANDLES = [
  'Kidlat', 'Bagsik', 'Sigaw', 'Ligaya', 'Ulap', 'Tala', 'Buhawi', 'Alab',
  'Bituin', 'Hiraya', 'Malaya', 'Sikat', 'Tanglaw', 'Bathala', 'Mayari', 'Tadhana',
  'Hangin', 'Apoy', 'Yelo', 'Bulkan', 'Lindol', 'Unos', 'Bagyo', 'Salpok',
  'Bilis', 'Lakas', 'Talas', 'Tapang', 'Gilas', 'Sipag', 'Diskarte', 'Ginto',
  'Pilak', 'Tanso', 'Bakal', 'Kristal', 'Anino', 'Liwanag', 'Dilim', 'Umaga',
  'Gabi', 'Tanghali', 'Silakbo', 'Alimpuyo', 'Ragasa', 'Hampas', 'Tigas', 'Pusa',
  'Lawiswis', 'Simoy', 'Alapaap', 'Bughaw', 'Luntian', 'Pula', 'Dilaw', 'Uling',
  'Sanib', 'Tibay', 'Agos', 'Sulyap', 'Hiwaga', 'Palad', 'Yapak', 'Guhit',
]

const CIRCUITS = [
  'Bayanihan Invitational', 'Archipelago Open', 'Kalayaan Series', 'Collegiate Cup',
  'Metro Championship', 'Rising Circuit', 'Island Cup', 'Pasko Showdown',
]


/** Small deterministic PRNG; every generator seeds it from the game id. */
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function seedFrom(...parts) {
  let h = 2166136261
  for (const part of parts.join('|')) {
    h ^= part.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Picks `count` distinct entries from `pool`, deterministically. */
function pick(pool, count, rand) {
  const copy = [...pool]
  const out = []
  for (let i = 0; i < count && copy.length; i += 1) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0])
  }
  return out
}

const round = (n, dp = 0) => Number(n.toFixed(dp))

/**
 * The two headline stats differ per title, so they are generated from the
 * stat labels rather than assumed to be ACS and K/D.
 */
function statValues(game, rand, strength) {
  const make = (label) => {
    if (label.includes('%') || label === 'Win rate') return `${round(48 + strength * 22 + rand() * 4)}%`
    if (label === 'Avg place') return round(1.4 + (1 - strength) * 5 + rand(), 1)
    if (label === 'KDA') return round(2.1 + strength * 2.4 + rand() * 0.4, 2)
    if (label === 'K/D' || label === 'Entry K/D' || label === 'Rating') return round(0.94 + strength * 0.5 + rand() * 0.06, 2)
    if (label === 'CS/min') return round(7.2 + strength * 2.2 + rand() * 0.4, 1)
    if (label === 'GPM') return Math.round(430 + strength * 260 + rand() * 40)
    if (label === 'XPM') return Math.round(460 + strength * 280 + rand() * 40)
    if (label === 'Gold/min') return Math.round(620 + strength * 260 + rand() * 40)
    if (label === 'APM') return Math.round(240 + strength * 190 + rand() * 30)
    if (label === 'ACS') return Math.round(198 + strength * 88 + rand() * 12)
    if (label === 'ADR') return Math.round(66 + strength * 34 + rand() * 6)
    if (label.startsWith('Dmg')) return Math.round(1900 + strength * 1400 + rand() * 200)
    if (label.startsWith('Elims')) return round(8.4 + strength * 4.5 + rand(), 1)
    if (label.startsWith('Goals')) return round(0.9 + strength * 1.4 + rand() * 0.2, 2)
    if (label.startsWith('Saves')) return round(1.1 + strength * 1.5 + rand() * 0.2, 2)
    if (label.startsWith('Elims/game')) return round(3.2 + strength * 4, 1)
    if (label === 'Booyahs') return Math.round(4 + strength * 14 + rand() * 2)
    if (label === 'Plants') return Math.round(18 + strength * 30 + rand() * 5)
    if (label === 'Perfects') return Math.round(2 + strength * 16 + rand() * 3)
    if (label === 'Crown diff' || label === 'Round diff' || label === 'Stock diff')
      return `${strength > 0.45 ? '+' : ''}${round((strength - 0.45) * 5.5 + rand() * 0.4, 1)}`
    if (label === 'Eng. won' || label === 'Obj. time' || label === 'Dmg share' || label === 'Star rate' || label === 'Top 4 rate')
      return `${round(42 + strength * 26 + rand() * 4)}%`
    if (label === 'xG') return round(1.4 + strength * 1.6 + rand() * 0.2, 2)
    return round(1 + strength * 4 + rand(), 1)
  }
  return game.stats.map((label) => ({ label, value: make(label) }))
}

// Memoised per game id: generators are pure, and regenerating on every render
// would be wasted work.
const cache = new Map()
function memo(key, build) {
  if (!cache.has(key)) cache.set(key, build())
  return cache.get(key)
}

export function teamsFor(gameId) {
  return memo(`teams:${gameId}`, () => {
    const game = GAMES_BY_ID[gameId]
    const rand = rng(seedFrom('teams', gameId))
    return pick(ORGS, 8, rand).map((name, i) => {
      // Seed position sets the shape of the table, but each team gets its own
      // jitter on top: without it the nth-ranked team of every title lands on
      // the same record, and a cross-title leaderboard becomes twenty-five
      // identical 25-2 rows.
      const jitter = (rand() - 0.5) * 0.3
      const strength = Math.min(1, Math.max(0.05, 1 - i / 9 + jitter))
      const wins = Math.round(6 + strength * 18 + rand() * 4)
      const losses = Math.round(1 + (1 - strength) * 15 + rand() * 3)
      return {
        id: `${gameId}-t${i}`,
        gameId,
        name,
        tier: TIERS[Math.min(4, Math.floor(strength * 4.6))],
        region: game.regions[Math.floor(rand() * game.regions.length)],
        record: `${wins}-${losses}`,
        streak: Math.round(strength * 7 * rand()),
        form: Array.from({ length: 5 }, () => (rand() < 0.35 + strength * 0.4 ? 'w' : 'l')),
      }
    })
  })
}

export function playersFor(gameId) {
  return memo(`players:${gameId}`, () => {
    const game = GAMES_BY_ID[gameId]
    const gameIndex = GAMES.findIndex((g) => g.id === gameId)
    const rand = rng(seedFrom('players', gameId))
    const teams = teamsFor(gameId)
    // Offset the handle pool per title so two scenes don't share a player.
    const rotated = [...HANDLES.slice(gameIndex * 2), ...HANDLES.slice(0, gameIndex * 2)]

    return pick(rotated, 10, rand).map((name, i) => {
      const strength = 1 - i / 11
      return {
        id: `${gameId}-p${i}`,
        gameId,
        name,
        // Round-robin so every team fields at least one ladder player; the
        // League module builds rosters on top of this and would otherwise
        // leave the bottom half of the table with nobody on it.
        team: teams[i % teams.length].name,
        role: game.roles[i % game.roles.length],
        tier: TIERS[Math.min(4, Math.floor(strength * 4.6))],
        rating: Math.round(1780 + strength * 700 + rand() * 60),
        delta: Math.round((rand() - 0.35) * 60),
        stats: statValues(game, rand, strength),
      }
    })
  })
}

export function liveMatchesFor(gameId) {
  return memo(`live:${gameId}`, () => {
    const game = GAMES_BY_ID[gameId]
    const rand = rng(seedFrom('live', gameId))
    const teams = teamsFor(gameId)
    const kinds = ['Playoffs', 'Qualifier', 'Open scrim', 'Group stage', 'Ladder match']
    const solo = game.teamSize === 1
    const names = solo ? playersFor(gameId).map((p) => p.name) : teams.map((t) => t.name)

    return Array.from({ length: 3 }, (_, i) => {
      const a = names[i * 2 % names.length]
      const b = names[(i * 2 + 1) % names.length]
      const best = game.unit === 'Match' ? 30 : 13
      const score = [Math.round(rand() * best), Math.round(rand() * best)]
      // A round-by-round history consistent with the score, so the live view
      // can show how the lead was built rather than just the total.
      const timeline = [
        ...Array.from({ length: score[0] }, () => 'a'),
        ...Array.from({ length: score[1] }, () => 'b'),
      ]
      for (let k = timeline.length - 1; k > 0; k -= 1) {
        const j = Math.floor(rand() * (k + 1))
        ;[timeline[k], timeline[j]] = [timeline[j], timeline[k]]
      }

      return {
        id: `${gameId}-lm${i}`,
        gameId,
        sides: [a, b],
        score,
        timeline,
        unitLabel: `${game.unit} ${1 + Math.floor(rand() * 3)}`,
        stageLabel: `${game.unit} ${1 + Math.floor(rand() * 3)} of ${game.teamSize === 1 ? 5 : 3}`,
        tier: teams[i].tier,
        region: teams[i].region,
        viewers: Math.round(1200 + rand() * 48000),
        clock: Math.round(180 + rand() * 1500),
        kind: kinds[Math.floor(rand() * kinds.length)],
        eventId: `${gameId}-e${i % 4}`,
      }
    })
  })
}

export function openScrimsFor(gameId) {
  return memo(`scrims:${gameId}`, () => {
    const game = GAMES_BY_ID[gameId]
    const rand = rng(seedFrom('scrims', gameId))
    const teams = teamsFor(gameId)
    const starts = ['in 20 min', 'in 45 min', 'in 1h 10m', 'in 2h', 'in 3h 30m', 'tonight']
    const formats = game.teamSize === 1 ? ['FT3', 'FT5', 'FT7'] : ['Bo1', 'Bo3', 'Bo5']

    return teams.slice(0, 6).map((team, i) => ({
      id: `${gameId}-os${i}`,
      gameId,
      team: team.name,
      tier: team.tier,
      region: team.region,
      // A slot is a seat on the roster, so capacity follows the title.
      capacity: game.teamSize,
      slots: 1 + Math.floor(rand() * Math.max(1, game.teamSize - 1)),
      starts: starts[i % starts.length],
      format: formats[Math.floor(rand() * formats.length)],
      window: `Open ${6 + i}:00–${8 + i}:00 PM`,
      open: rand() > 0.25,
    }))
  })
}

export function eventsFor(gameId) {
  return memo(`events:${gameId}`, () => {
    const game = GAMES_BY_ID[gameId]
    const rand = rng(seedFrom('events', gameId))
    const windows = ['Mar 12 – Mar 18', 'Mar 14 – Mar 20', 'Mar 22 – Mar 24', 'Apr 9 – Apr 14']
    // How much of a title's circuit is actually in play varies by scene, so
    // the running count is seeded rather than the same everywhere.
    const running = 1 + Math.floor(rand() * 3)
    // Running first, then the one taking sign-ups, then merely announced.
    const statuses = Array.from({ length: 4 }, (_, i) =>
      i < running ? 'live' : i === running ? 'open' : 'soon',
    )
    const liveStages = ['Grand final', 'Semifinals', 'Quarterfinals']
    const stageFor = (i) => (i < running ? liveStages[i] : statuses[i] === 'open' ? 'Registration' : 'Announced')
    const remainingFor = (i) => (i < running ? [2, 4, 8][i] : 0)

    return pick(CIRCUITS, 4, rand).map((circuit, i) => {
      // Peso pools at Philippine circuit scale: a barangay-level open runs a
      // few hundred thousand, a national final a few million.
      const prize = Math.round((150 + rand() * 3400) * game.scale) * 1000
      return {
        id: `${gameId}-e${i}`,
        gameId,
        name: `${game.short} ${circuit}`,
        status: statuses[i],
        stage: stageFor(i),
        teamsRemaining: remainingFor(i),
        prize: formatPrize(prize),
        prizeValue: prize,
        teams: [8, 16, 24, 32, 48, 64][Math.floor(rand() * 6)],
        window: windows[i],
        region: rand() > 0.5 ? 'Nationwide' : game.regions[Math.floor(rand() * game.regions.length)],
        // Each event carries its own countdown so the rotating hero shows a
        // different clock per slide rather than one shared timer.
        startsInSeconds: Math.round((0.5 + rand() * 6) * 86400),
        venue: ['Pasay', 'Quezon City', 'Cebu City', 'Davao City', 'Manila', 'Iloilo City', 'Online'][
          Math.floor(rand() * 7)
        ],
      }
    })
  })
}

/** Aggregates one generator across every title, for the "All games" view. */
export function acrossGames(generator, { limit, sortBy } = {}) {
  let rows = GAMES.flatMap((game) => generator(game.id))
  if (sortBy) rows = [...rows].sort(sortBy)
  return limit ? rows.slice(0, limit) : rows
}

/** Rough "how busy is this scene" number, used on the browse tiles. */
export function activityFor(gameId) {
  return memo(`activity:${gameId}`, () => {
    const game = GAMES_BY_ID[gameId]
    const rand = rng(seedFrom('activity', gameId))
    return {
      live: Math.round(2 + rand() * 40 * game.scale),
      scrims: Math.round(20 + rand() * 400 * game.scale),
      players: Math.round((0.4 + rand() * 9 * game.scale) * 1000),
    }
  })
}

/**
 * A single-elimination bracket for one event. Seeded from the event id so two
 * tournaments in the same title do not share a draw.
 *
 * Eight teams (quarterfinals through the final) is what fits three readable
 * columns; the first round is labelled from the event's real field size.
 */
export function bracketFor(gameId, eventId) {
  return memo(`bracket:${eventId}`, () => {
    const game = GAMES_BY_ID[gameId]
    const rand = rng(seedFrom('bracket', eventId))
    const pool = game.teamSize === 1 ? playersFor(gameId) : teamsFor(gameId)
    const entrants = pick(pool, 8, rand)
    const best = game.unit === 'Match' ? 3 : 2

    const play = (a, b, decided) => {
      const aWins = rand() > 0.45
      const loserScore = Math.floor(rand() * best)
      return {
        a,
        b,
        score: aWins ? [best, loserScore] : [loserScore, best],
        winner: aWins ? a : b,
        done: decided,
      }
    }

    const quarters = [0, 1, 2, 3].map((i) => ({
      id: `${eventId}-q${i}`,
      ...play(entrants[i], entrants[7 - i], true),
    }))
    const semis = [0, 1].map((i) => ({
      id: `${eventId}-s${i}`,
      ...play(quarters[i * 2].winner, quarters[i * 2 + 1].winner, true),
    }))
    const final = {
      id: `${eventId}-f0`,
      a: semis[0].winner,
      b: semis[1].winner,
      score: [best - 1, best - 1],
      done: false,
    }

    return [
      { round: 'Quarterfinals', matches: quarters },
      { round: 'Semifinals', matches: semis },
      { round: 'Grand final', matches: [final] },
    ]
  })
}

/** How much circuit activity a title has, for the bracket picker cards. */
export function circuitSummaryFor(gameId) {
  return memo(`circuit:${gameId}`, () => {
    const events = eventsFor(gameId)
    const live = events.filter((e) => e.status === 'live')
    return {
      ongoing: live.length,
      upcoming: events.length - live.length,
      prizeValue: events.reduce((sum, e) => sum + e.prizeValue, 0),
      liveMatches: liveMatchesFor(gameId).length,
      nextStage: live[0]?.stage ?? events[0]?.stage,
    }
  })
}

/**
 * A ladder player by id, across every title.
 *
 * Ids are `${gameId}-p${n}`, so the title is recoverable from the id and only
 * that one scene has to be generated - scanning all twenty-five to find one
 * row would build every ladder in the app to answer a single lookup.
 */
export function findPlayer(playerId = '') {
  const gameId = GAMES.map((g) => g.id)
    .filter((id) => playerId.startsWith(`${id}-p`))
    // Longest match wins: `cs2-p1` and `cs2` are fine, but a future id that is
    // a prefix of another would otherwise resolve to the wrong scene.
    .sort((a, b) => b.length - a.length)[0]
  return gameId ? (playersFor(gameId).find((p) => p.id === playerId) ?? null) : null
}
