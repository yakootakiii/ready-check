/**
 * The title catalog. Outplay is game-agnostic, so nothing in the UI may
 * assume Valorant (or even PC): a title carries its own roles, its own stat
 * vocabulary, its own word for a unit of play, and its own strong regions.
 *
 * `genre` drives the accent colour, so a tile's colour tells you what kind of
 * game it is before you read the name. `platform` drives real behaviour -
 * mobile titles get thermal/battery diagnostics instead of frame rate.
 *
 * Two things here exist for the intelligence layer specifically:
 *
 * - `INTEL_COVERAGE` says how deep the model actually is for a title. The
 *   product is honest about this: one title is modelled properly, a few are
 *   in calibration, the rest are ecosystem-only. Screens read it and say so
 *   rather than implying every scene has the same depth of analysis.
 * - `GENRE_LEXICON` gives the insight writer the right nouns. "Objective
 *   control" means towers in a MOBA, site control in a tactical shooter and
 *   zone timing in a battle royale, so the language is keyed to genre rather
 *   than hardcoded to one game or duplicated 25 times.
 *
 * Team and player names throughout the app are fictional on purpose; only the
 * game titles are real.
 */

export const GENRES = {
  tactical: { label: 'Tactical FPS', text: 'text-signal', bg: 'bg-signal', border: 'border-signal' },
  moba: { label: 'MOBA', text: 'text-diamond', bg: 'bg-diamond', border: 'border-diamond' },
  br: { label: 'Battle royale', text: 'text-ember', bg: 'bg-ember', border: 'border-ember' },
  fighting: { label: 'Fighting', text: 'text-gold', bg: 'bg-gold', border: 'border-gold' },
  sports: { label: 'Sports', text: 'text-platinum', bg: 'bg-platinum', border: 'border-platinum' },
  strategy: { label: 'Strategy', text: 'text-silver', bg: 'bg-silver', border: 'border-silver' },
  hero: { label: 'Hero shooter', text: 'text-bronze', bg: 'bg-bronze', border: 'border-bronze' },
}

export const PLATFORMS = ['PC', 'Mobile', 'Console']

/**
 * `logoSlug` names a mark on Simple Icons (CC0) that `npm run logos` vendors
 * into src/assets/logos/. Only real game marks are listed - a publisher logo
 * standing in for one of its games would misidentify it. Titles without a
 * slug fall back to the monogram tile until a file is dropped in by hand.
 *
 * @property unit      what one leg of a series is called ("Map", "Game", "Set")
 * @property teamSize  players per side; 1 means an individual discipline
 * @property stats     the two per-player numbers this scene actually quotes
 * @property roles     the role vocabulary used on profiles and org listings
 * @property regions   Philippine regions where the scene is strongest
 * @property scale     relative circuit size, drives mock prize pools
 */
export const GAMES = [
  // --- PC ------------------------------------------------------------------
  {
    id: 'valorant', logoSlug: 'valorant', name: 'Valorant', short: 'VAL', platform: 'PC', genre: 'tactical',
    teamSize: 5, unit: 'Map', scale: 1.0,
    stats: ['ACS', 'K/D'],
    roles: ['Duelist', 'Initiator', 'Controller', 'Sentinel'],
    regions: ['NCR', 'CALABARZON', 'Cebu', 'Baguio', 'Pampanga'],
  },
  {
    id: 'cs2', logoSlug: 'counterstrike', name: 'Counter-Strike 2', short: 'CS2', platform: 'PC', genre: 'tactical',
    teamSize: 5, unit: 'Map', scale: 1.0,
    stats: ['ADR', 'Rating'],
    roles: ['Entry', 'AWPer', 'Support', 'Lurker', 'IGL'],
    regions: ['NCR', 'Pampanga', 'Cebu', 'Central Luzon'],
  },
  {
    id: 'lol', logoSlug: 'leagueoflegends', name: 'League of Legends', short: 'LOL', platform: 'PC', genre: 'moba',
    teamSize: 5, unit: 'Game', scale: 1.0,
    stats: ['KDA', 'CS/min'],
    roles: ['Top', 'Jungle', 'Mid', 'Bot', 'Support'],
    regions: ['NCR', 'Cebu', 'Laguna', 'Baguio'],
  },
  {
    id: 'dota2', logoSlug: 'dota2', name: 'Dota 2', short: 'DOTA', platform: 'PC', genre: 'moba',
    teamSize: 5, unit: 'Game', scale: 1.0,
    stats: ['GPM', 'XPM'],
    roles: ['Carry', 'Mid', 'Offlane', 'Soft support', 'Hard support'],
    regions: ['NCR', 'Cebu', 'Davao', 'Bacolod', 'Iloilo'],
  },
  {
    id: 'overwatch2', name: 'Overwatch 2', short: 'OW2', platform: 'PC', genre: 'hero',
    teamSize: 5, unit: 'Map', scale: 0.7,
    stats: ['Elims/10', 'Dmg/10'],
    roles: ['Tank', 'Damage', 'Support'],
    regions: ['NCR', 'CALABARZON', 'Cebu'],
  },
  {
    id: 'r6', name: 'Rainbow Six Siege', short: 'R6', platform: 'PC', genre: 'tactical',
    teamSize: 5, unit: 'Map', scale: 0.8,
    stats: ['Entry K/D', 'Plants'],
    roles: ['Entry', 'Support', 'Flex', 'Anchor', 'IGL'],
    regions: ['NCR', 'Pampanga', 'Cavite'],
  },
  {
    id: 'apex', name: 'Apex Legends', short: 'APEX', platform: 'PC', genre: 'br',
    teamSize: 3, unit: 'Match', scale: 0.7,
    stats: ['Avg place', 'Dmg/game'],
    roles: ['Fragger', 'IGL', 'Support'],
    regions: ['NCR', 'Cebu', 'Davao'],
  },
  {
    id: 'fortnite', logoSlug: 'fortnite', name: 'Fortnite', short: 'FN', platform: 'PC', genre: 'br',
    teamSize: 2, unit: 'Match', scale: 0.9,
    stats: ['Avg place', 'Elims/game'],
    roles: ['Builder', 'Fragger', 'Support'],
    regions: ['NCR', 'CALABARZON', 'Cebu', 'Iloilo'],
  },
  {
    id: 'rocketleague', name: 'Rocket League', short: 'RL', platform: 'PC', genre: 'sports',
    teamSize: 3, unit: 'Game', scale: 0.7,
    stats: ['Goals/game', 'Saves/game'],
    roles: ['Striker', 'Midfield', 'Defender'],
    regions: ['NCR', 'Laguna', 'Cebu'],
  },
  {
    id: 'cod', name: 'Call of Duty', short: 'COD', platform: 'PC', genre: 'tactical',
    teamSize: 4, unit: 'Map', scale: 0.8,
    stats: ['K/D', 'Eng. won'],
    roles: ['Slayer', 'Objective', 'Anchor', 'IGL'],
    regions: ['NCR', 'Cavite', 'Pampanga'],
  },
  {
    id: 'sc2', name: 'StarCraft II', short: 'SC2', platform: 'PC', genre: 'strategy',
    teamSize: 1, unit: 'Game', scale: 0.4,
    stats: ['APM', 'Win rate'],
    roles: ['Terran', 'Zerg', 'Protoss'],
    regions: ['NCR', 'Baguio', 'Cebu'],
  },
  {
    id: 'tft', name: 'Teamfight Tactics', short: 'TFT', platform: 'PC', genre: 'strategy',
    teamSize: 1, unit: 'Lobby', scale: 0.5,
    stats: ['Avg place', 'Top 4 rate'],
    roles: ['Flex', 'Forced comp', 'Tempo'],
    regions: ['NCR', 'Cebu', 'Davao'],
  },

  // --- Mobile --------------------------------------------------------------
  {
    id: 'mlbb', name: 'Mobile Legends: Bang Bang', short: 'MLBB', platform: 'Mobile', genre: 'moba',
    teamSize: 5, unit: 'Game', scale: 1.0,
    stats: ['KDA', 'Gold/min'],
    roles: ['Gold lane', 'EXP lane', 'Mid lane', 'Jungler', 'Roamer'],
    regions: ['NCR', 'Cebu', 'Davao', 'Iloilo', 'Cagayan de Oro', 'Pampanga', 'Bacolod'],
  },
  {
    id: 'hok', name: 'Honor of Kings', short: 'HOK', platform: 'Mobile', genre: 'moba',
    teamSize: 5, unit: 'Game', scale: 1.0,
    stats: ['KDA', 'Dmg share'],
    roles: ['Clash lane', 'Farm lane', 'Mid lane', 'Jungler', 'Roamer'],
    regions: ['NCR', 'Cebu', 'CALABARZON'],
  },
  {
    id: 'wildrift', name: 'Wild Rift', short: 'WR', platform: 'Mobile', genre: 'moba',
    teamSize: 5, unit: 'Game', scale: 0.6,
    stats: ['KDA', 'CS/min'],
    roles: ['Baron', 'Jungle', 'Mid', 'Dragon', 'Support'],
    regions: ['NCR', 'Cebu', 'Laguna', 'Davao'],
  },
  {
    id: 'aov', name: 'Arena of Valor', short: 'AOV', platform: 'Mobile', genre: 'moba',
    teamSize: 5, unit: 'Game', scale: 0.6,
    stats: ['KDA', 'Gold/min'],
    roles: ['Slayer', 'Farm', 'Mid', 'Jungle', 'Support'],
    regions: ['NCR', 'Cavite', 'Bicol'],
  },
  {
    id: 'pubgm', logoSlug: 'pubg', name: 'PUBG Mobile', short: 'PUBGM', platform: 'Mobile', genre: 'br',
    teamSize: 4, unit: 'Match', scale: 1.0,
    stats: ['Avg place', 'Dmg/match'],
    roles: ['Fragger', 'IGL', 'Support', 'Scout'],
    regions: ['NCR', 'Davao', 'Zamboanga', 'Bicol', 'Cagayan de Oro'],
  },
  {
    id: 'freefire', name: 'Free Fire', short: 'FF', platform: 'Mobile', genre: 'br',
    teamSize: 4, unit: 'Match', scale: 0.9,
    stats: ['Avg place', 'Booyahs'],
    roles: ['Rusher', 'IGL', 'Support', 'Sniper'],
    regions: ['Davao', 'Cagayan de Oro', 'Zamboanga', 'Iloilo', 'NCR'],
  },
  {
    id: 'codm', name: 'Call of Duty: Mobile', short: 'CODM', mono: 'CM', platform: 'Mobile', genre: 'tactical',
    teamSize: 5, unit: 'Map', scale: 0.7,
    stats: ['K/D', 'Obj. time'],
    roles: ['Slayer', 'Objective', 'Anchor', 'IGL'],
    regions: ['NCR', 'Cavite', 'Davao', 'Iloilo', 'Cebu'],
  },
  {
    id: 'clashroyale', name: 'Clash Royale', short: 'CR', platform: 'Mobile', genre: 'strategy',
    teamSize: 1, unit: 'Set', scale: 0.5,
    stats: ['Crown diff', 'Set win %'],
    roles: ['Beatdown', 'Cycle', 'Control', 'Bridge spam'],
    regions: ['NCR', 'Cebu', 'Bacolod'],
  },
  {
    id: 'brawlstars', name: 'Brawl Stars', short: 'BS', platform: 'Mobile', genre: 'hero',
    teamSize: 3, unit: 'Set', scale: 0.5,
    stats: ['Win rate', 'Star rate'],
    roles: ['Tank', 'Damage', 'Support'],
    regions: ['NCR', 'CALABARZON', 'Cebu'],
  },

  // --- Console -------------------------------------------------------------
  {
    id: 'sf6', name: 'Street Fighter 6', short: 'SF6', platform: 'Console', genre: 'fighting',
    teamSize: 1, unit: 'Set', scale: 0.5,
    stats: ['Set win %', 'Perfects'],
    roles: ['Rushdown', 'Zoner', 'Grappler', 'All-round'],
    regions: ['NCR', 'Cebu', 'Pampanga'],
  },
  {
    id: 'tekken8', name: 'Tekken 8', short: 'TK8', platform: 'Console', genre: 'fighting',
    teamSize: 1, unit: 'Set', scale: 0.5,
    stats: ['Set win %', 'Round diff'],
    roles: ['Rushdown', 'Poker', 'Mishima', 'All-round'],
    regions: ['NCR', 'Cebu', 'Davao', 'Bacolod'],
  },
  {
    id: 'smash', name: 'Super Smash Bros. Ultimate', short: 'SSBU', platform: 'Console', genre: 'fighting',
    teamSize: 1, unit: 'Set', scale: 0.4,
    stats: ['Set win %', 'Stock diff'],
    roles: ['Rushdown', 'Zoner', 'Grappler', 'Swordie'],
    regions: ['NCR', 'Cebu', 'Baguio'],
  },
  {
    id: 'eafc', name: 'EA Sports FC', short: 'FC', platform: 'Console', genre: 'sports',
    teamSize: 1, unit: 'Match', scale: 0.6,
    stats: ['Goals/game', 'xG'],
    roles: ['Attacking', 'Balanced', 'Defensive'],
    regions: ['NCR', 'CALABARZON', 'Cebu'],
  },
]

export const GAMES_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]))

export const getGame = (id) => GAMES_BY_ID[id] ?? null

export const genreOf = (game) => GENRES[game.genre]

/**
 * Two-letter monogram for the tile art - no real logos are used anywhere.
 * `mono` overrides it where two titles would otherwise collide.
 */
export const monogram = (game) => game.mono ?? game.short.slice(0, 2)

/**
 * How deep the intelligence model runs for a title.
 *
 * Outplay's MVP models one game properly rather than claiming twenty-five.
 * `full` means Competitive DNA, matchup intelligence and post-match learning
 * are all live; `beta` means the model is calibrating and its confidence is
 * shown as provisional; `planned` means the title has an ecosystem on the
 * platform - ladders, teams, tournaments, scrims - but no behavioural model
 * yet. Anything unlisted is `planned`.
 */
export const INTEL_COVERAGE = {
  valorant: 'full',
  mlbb: 'beta',
  cs2: 'beta',
  dota2: 'beta',
  lol: 'beta',
}

export const COVERAGE = {
  full: {
    key: 'full',
    label: 'Full intelligence',
    short: 'Full',
    note: 'Competitive DNA, matchup intelligence and post-match learning are live.',
    text: 'text-edge',
    border: 'border-edge',
    bg: 'bg-edge',
  },
  beta: {
    key: 'beta',
    label: 'Calibrating',
    short: 'Beta',
    note: 'The model is still calibrating on this title. Treat confidence as provisional.',
    text: 'text-signal',
    border: 'border-signal',
    bg: 'bg-signal',
  },
  planned: {
    key: 'planned',
    label: 'Ecosystem only',
    short: 'Planned',
    note: 'Ladders, teams and tournaments are covered. Behavioural modelling is not live yet.',
    text: 'text-ink-muted',
    border: 'border-line',
    bg: 'bg-raised',
  },
}

export const coverageKeyOf = (game) => INTEL_COVERAGE[game?.id] ?? 'planned'

export const coverageOf = (game) => COVERAGE[coverageKeyOf(game)]

/**
 * The words an insight uses, keyed by genre.
 *
 * An insight that says "they contest objectives early" has to mean towers in a
 * MOBA and site control in a tactical shooter. Keying the vocabulary to genre
 * gives every one of the 25 titles usable language from seven entries, and
 * keeps the insight writer from hardcoding one game's nouns.
 *
 * @property objective  what a team fights over
 * @property early      the opening phase of one unit of play
 * @property late       the closing phase
 * @property plan       the pre-round or pre-game decision layer
 * @property space      the resource a side takes when it plays forward
 */
export const GENRE_LEXICON = {
  tactical: {
    objective: 'site control',
    early: 'opening duels',
    late: 'post-plant and retakes',
    plan: 'buy and utility plan',
    space: 'map control',
  },
  moba: {
    objective: 'objective control',
    early: 'the laning phase',
    late: 'late-game teamfights',
    plan: 'the draft',
    space: 'vision and jungle space',
  },
  br: {
    objective: 'zone positioning',
    early: 'the early drop',
    late: 'final circles',
    plan: 'the landing plan',
    space: 'rotation timing',
  },
  fighting: {
    objective: 'neutral control',
    early: 'the first two rounds',
    late: 'the final round',
    plan: 'character and counterpick',
    space: 'screen position',
  },
  sports: {
    objective: 'possession',
    early: 'the opening minutes',
    late: 'the closing minutes',
    plan: 'formation and rotation',
    space: 'the attacking half',
  },
  strategy: {
    objective: 'board control',
    early: 'the opening build',
    late: 'the late game',
    plan: 'the composition plan',
    space: 'tempo and economy',
  },
  hero: {
    objective: 'point control',
    early: 'the first fight',
    late: 'overtime',
    plan: 'the composition',
    space: 'high ground and space',
  },
}

export const lexiconOf = (game) => GENRE_LEXICON[game?.genre] ?? GENRE_LEXICON.tactical
