// Static mock data - this is a look-and-feel mockup, not a working backend.

/**
 * The signed-in player. Competitors routinely compete in more than one title
 * (and on more than one platform), so the profile is a list keyed by game
 * rather than a single hardcoded role and stat pair.
 */
export const player = {
  firstName: 'Kiel',
  fullName: 'Kiel "Kidlat" Ramos',
  handle: 'Kidlat',
  initials: 'KR',
  hoursThisWeek: 22,
  primaryGameId: 'valorant',
  profiles: [
    {
      gameId: 'valorant',
      role: 'Duelist',
      tier: 'diamond',
      rating: 2410,
      region: 'NCR',
      availability: 'Evenings PHT',
      winRate: '58%',
      scrimsLogged: 142,
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
      scrimsLogged: 88,
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
      scrimsLogged: 37,
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

export const readiness = {
  score: 82,
  trend: [64, 68, 71, 70, 76, 79, 82],
  reason: 'Sleep ok, load high',
  direction: 'up',
  factors: [
    { label: 'Sleep', value: '7h 20m', state: 'ok' },
    { label: 'Practice load', value: '22h / wk', state: 'warn' },
    { label: 'Match stress', value: 'Moderate', state: 'ok' },
  ],
}

export const vod = {
  title: 'Ascent vs. Rival Esports - Map 2',
  recorded: 'Mar 14',
  durationLabel: '28:10',
  durationSeconds: 1690,
  positionSeconds: 765,
  tags: [
    { id: 't1', at: 372, label: 'Rotation late - B site' },
    { id: 't2', at: 843, label: 'Good trade, follow up slow' },
    { id: 't3', at: 1360, label: 'Econ mismanagement' },
  ],
}

export const vodNotes = [
  { id: 'n1', map: 'Map 2', note: 'Rotate timing', tags: 3 },
  { id: 'n2', map: 'Map 1', note: 'Retake spacing', tags: 2 },
]

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
  // Deliberately title-neutral: this reel sits on every game's profile tab.
  { id: 'h1', label: 'Late-game teamfight', length: '0:42' },
  { id: 'h2', label: 'Opening picks reel', length: '1:18' },
  { id: 'h3', label: 'Playoffs clutch', length: '0:55' },
]
