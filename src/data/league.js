/**
 * The League module's data: who backs each team, what they have won, who plays
 * for them, and the school programs that run rosters across several titles.
 *
 * Built on top of generate.js rather than beside it — a team here is the same
 * team that appears in a bracket or a ladder, with more attached. Everything is
 * seeded from ids, so a school's roster is the same on every render.
 *
 * Schools and companies are invented — Philippine in character, but not real
 * institutions. Every record, roster and championship here is fabricated, and
 * attaching those to a real university or org would misrepresent it.
 */
import { GAMES, GAMES_BY_ID } from './games'
import { eventsFor, playersFor, teamsFor } from './generate'

/* --- Backers ------------------------------------------------------------- */

export const SCHOOLS = [
  { id: 'mabini-state', name: 'Mabini State University', short: 'MSU', city: 'Quezon City', regions: ['NCR', 'Central Luzon', 'CALABARZON'], founded: 1948 },
  { id: 'san-lorenzo', name: 'San Lorenzo University', short: 'SLU', city: 'Manila', regions: ['NCR', 'CALABARZON', 'Cavite'], founded: 1911 },
  { id: 'katipunan-tech', name: 'Katipunan Institute of Technology', short: 'KIT', city: 'Makati', regions: ['NCR', 'Laguna', 'Cavite'], founded: 1967 },
  { id: 'sto-nino', name: 'Sto. Niño University', short: 'SNU', city: 'Cebu City', regions: ['Cebu', 'Bacolod', 'Iloilo'], founded: 1935 },
  { id: 'bulawan-state', name: 'Bulawan State College', short: 'BSC', city: 'Davao City', regions: ['Davao', 'Cagayan de Oro', 'Zamboanga'], founded: 1972 },
  { id: 'sierra-madre', name: 'Sierra Madre University', short: 'SMU', city: 'Baguio', regions: ['Baguio', 'Central Luzon', 'NCR'], founded: 1955 },
  { id: 'kalayaan-poly', name: 'Kalayaan Polytechnic University', short: 'KPU', city: 'Pasig', regions: ['NCR', 'Pampanga', 'Central Luzon'], founded: 1981 },
  { id: 'panay-tech', name: 'Panay Institute of Technology', short: 'PIT', city: 'Iloilo City', regions: ['Iloilo', 'Bacolod', 'Cebu'], founded: 1963 },
  { id: 'bicol-bay', name: 'Bicol Bay College', short: 'BBC', city: 'Legazpi', regions: ['Bicol', 'CALABARZON', 'NCR'], founded: 1977 },
  { id: 'zamboanga-coastal', name: 'Zamboanga Coastal University', short: 'ZCU', city: 'Zamboanga City', regions: ['Zamboanga', 'Davao', 'Cagayan de Oro'], founded: 1969 },
  { id: 'northern-mindanao', name: 'Northern Mindanao University', short: 'NMU', city: 'Cagayan de Oro', regions: ['Cagayan de Oro', 'Davao', 'Zamboanga'], founded: 1958 },
  { id: 'pampanga-central', name: 'Pampanga Central College', short: 'PCC', city: 'Angeles', regions: ['Pampanga', 'Central Luzon', 'NCR'], founded: 1974 },
]

export const COMPANIES = [
  { id: 'tanglaw-interactive', name: 'Tanglaw Interactive', short: 'TNG', hq: 'Manila', regions: ['NCR', 'CALABARZON', 'Central Luzon', 'Nationwide'], founded: 2014 },
  { id: 'sulo-media', name: 'Sulo Media Group', short: 'SLO', hq: 'Quezon City', regions: ['NCR', 'Pampanga', 'Baguio', 'Nationwide'], founded: 2016 },
  { id: 'bagwis-sports', name: 'Bagwis Sports', short: 'BGW', hq: 'Makati', regions: ['NCR', 'Laguna', 'Cavite'], founded: 2018 },
  { id: 'kalinaw-ventures', name: 'Kalinaw Ventures', short: 'KLV', hq: 'Cebu City', regions: ['Cebu', 'Bacolod', 'Iloilo'], founded: 2015 },
  { id: 'hiraya-holdings', name: 'Hiraya Holdings', short: 'HRY', hq: 'Taguig', regions: ['NCR', 'CALABARZON', 'Nationwide'], founded: 2012 },
  { id: 'sinag-entertainment', name: 'Sinag Entertainment', short: 'SNG', hq: 'Pasig', regions: ['NCR', 'Central Luzon', 'Cavite'], founded: 2019 },
  { id: 'dalisay-capital', name: 'Dalisay Capital', short: 'DLC', hq: 'Manila', regions: ['NCR', 'Bicol', 'CALABARZON'], founded: 2021 },
  { id: 'anahaw-group', name: 'Anahaw Group', short: 'ANH', hq: 'Davao City', regions: ['Davao', 'Cagayan de Oro', 'Zamboanga', 'Iloilo'], founded: 2017 },
]

const BACKERS_BY_ID = Object.fromEntries(
  [...SCHOOLS.map((s) => ({ ...s, type: 'school' })), ...COMPANIES.map((c) => ({ ...c, type: 'company' }))].map(
    (b) => [b.id, b],
  ),
)

export const backerById = (id) => BACKERS_BY_ID[id] ?? null

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

const pickOne = (list, rand) => (list.length ? list[Math.floor(rand() * list.length)] : null)

const winRateOf = (record) => {
  const [w, l] = record.split('-').map(Number)
  return w + l ? Math.round((w / (w + l)) * 100) : 0
}

/* --- Team profiles -------------------------------------------------------- */

const PLACEMENTS = ['1st', '2nd', '3rd', 'Top 4', 'Top 8']
const SEASONS = [2023, 2024, 2025]

/**
 * Which school or company runs a team. Backers only take teams in a region
 * they actually operate in, so a Manila university does not end up running an
 * EMEA roster.
 */
function backerFor(team) {
  const rand = rng(seedFrom('backer', team.id))
  const pool = Object.values(BACKERS_BY_ID).filter((b) => b.regions.includes(team.region))
  const candidates = pool.length ? pool : Object.values(BACKERS_BY_ID)
  // Schools run roughly a third of rosters, which is about right for a
  // platform that spans amateur through semi-pro.
  const wantSchool = rand() < 0.35
  const filtered = candidates.filter((b) => (wantSchool ? b.type === 'school' : b.type === 'company'))
  const from = filtered.length ? filtered : candidates
  return from[Math.floor(rand() * from.length)]
}

function accoladesFor(team) {
  const rand = rng(seedFrom('accolades', team.id))
  const events = eventsFor(team.gameId)
  const strength = winRateOf(team.record) / 100
  const count = Math.round(rand() * 3 + strength * 2)

  return Array.from({ length: count }, (_, i) => {
    // Stronger teams place higher on average, but every run is its own roll —
    // a fixed strength-to-placement map gives every good team the same trophy.
    const bias = (1 - strength) * 3
    const idx = Math.min(PLACEMENTS.length - 1, Math.max(0, Math.round(bias + (rand() - 0.35) * 4)))
    return {
      id: `${team.id}-ac${i}`,
      placement: PLACEMENTS[idx],
      event: events[(i + 1) % events.length].name,
      season: SEASONS[i % SEASONS.length],
    }
  }).sort((a, b) => b.season - a.season)
}

/**
 * The active roster. Ladder players already carry a team, so they are used
 * first and the rest is filled in — a team's stars stay the same people the
 * leaderboards show.
 */
function rosterFor(team) {
  const game = GAMES_BY_ID[team.gameId]
  const rand = rng(seedFrom('roster', team.id))
  const onLadder = playersFor(team.gameId).filter((p) => p.team === team.name)
  const size = Math.max(1, game.teamSize)

  const fillNames = ['Alon', 'Sanib', 'Yapak', 'Guhit', 'Simoy', 'Palad', 'Agos', 'Tibay', 'Hiwaga', 'Sulyap']
  const roster = [...onLadder]

  for (let i = roster.length; i < size; i += 1) {
    const strength = 0.35 + rand() * 0.4
    roster.push({
      id: `${team.id}-r${i}`,
      name: `${fillNames[Math.floor(rand() * fillNames.length)]}${Math.floor(rand() * 90 + 10)}`,
      team: team.name,
      role: game.roles[i % game.roles.length],
      tier: team.tier,
      rating: Math.round(1750 + strength * 600),
      delta: Math.round((rand() - 0.4) * 40),
      stats: [],
      onLadder: false,
    })
  }

  // Sort first, then hand out roles by slot, so a five-man roster covers five
  // distinct roles instead of fielding three duelists.
  return roster
    .slice(0, size)
    .sort((a, b) => b.rating - a.rating)
    .map((p, i) => ({
      ...p,
      role: game.roles[i % game.roles.length],
      onLadder: p.onLadder ?? true,
    }))
}

/** A team plus everything the League module shows about it. */
export function teamProfile(team) {
  return memo(`team:${team.id}`, () => {
    const game = GAMES_BY_ID[team.gameId]
    const events = eventsFor(team.gameId)
    const rand = rng(seedFrom('profile', team.id))
    const roster = rosterFor(team)

    return {
      ...team,
      game,
      backer: backerFor(team),
      accolades: accoladesFor(team),
      roster,
      topPlayer: roster[0],
      winRate: winRateOf(team.record),
      founded: 2012 + Math.floor(rand() * 12),
      // One running circuit plus the next one up. A team entered in every
      // live event of its game would inflate every program that fields it.
      tournaments: [
        pickOne(events.filter((e) => e.status === 'live'), rand),
        pickOne(events.filter((e) => e.status !== 'live'), rand),
      ].filter(Boolean),
    }
  })
}

export const allTeams = () => GAMES.flatMap((g) => teamsFor(g.id))

export const findTeam = (teamId) => allTeams().find((t) => t.id === teamId) ?? null

/* --- School and company profiles ------------------------------------------ */

/** Every backer with at least one roster, with those rosters attached. */
export function backerRosters() {
  return memo('backerRosters', () => {
    const byBacker = new Map()
    for (const team of allTeams()) {
      const backer = backerFor(team)
      if (!byBacker.has(backer.id)) byBacker.set(backer.id, [])
      byBacker.get(backer.id).push(team)
    }
    return byBacker
  })
}

export function backerProfile(backerId) {
  return memo(`backer:${backerId}`, () => {
    const backer = BACKERS_BY_ID[backerId]
    if (!backer) return null

    const teams = (backerRosters().get(backerId) ?? []).map(teamProfile)
    const games = [...new Set(teams.map((t) => t.gameId))].map((id) => GAMES_BY_ID[id])

    const totals = teams.reduce(
      (acc, t) => {
        const [w, l] = t.record.split('-').map(Number)
        acc.wins += w
        acc.losses += l
        acc.players += t.roster.length
        return acc
      },
      { wins: 0, losses: 0, players: 0 },
    )

    const accolades = teams
      .flatMap((t) => t.accolades.map((a) => ({ ...a, teamName: t.name, gameId: t.gameId })))
      .sort((a, b) => b.season - a.season)

    // Events the program's own teams are entered in — not every event running
    // in the games it happens to field, which would badly overstate it.
    const entered = new Map()
    for (const team of teams) {
      for (const event of team.tournaments) entered.set(event.id, event)
    }
    const events = [...entered.values()]

    return {
      ...backer,
      teams,
      games,
      players: totals.players,
      wins: totals.wins,
      losses: totals.losses,
      winRate: totals.wins + totals.losses
        ? Math.round((totals.wins / (totals.wins + totals.losses)) * 100)
        : 0,
      accolades,
      titles: accolades.filter((a) => a.placement === '1st').length,
      running: events.filter((e) => e.status === 'live'),
      pending: events.filter((e) => e.status !== 'live'),
    }
  })
}

/** Schools with an active roster, strongest program first. */
export function schoolsWithRosters() {
  return memo('schools', () =>
    SCHOOLS.map((s) => backerProfile(s.id))
      .filter((s) => s.teams.length > 0)
      .sort((a, b) => b.titles - a.titles || b.winRate - a.winRate),
  )
}

export function companiesWithRosters() {
  return memo('companies', () =>
    COMPANIES.map((c) => backerProfile(c.id))
      .filter((c) => c.teams.length > 0)
      .sort((a, b) => b.titles - a.titles || b.winRate - a.winRate),
  )
}
