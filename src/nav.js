import {
  Bracket,
  Broadcast,
  Building,
  Calendar,
  Dna,
  Film,
  Gauge,
  Heart,
  Home,
  IdCard,
  Layers,
  Radar,
  School,
  Sparkle,
  Target,
  Trend,
  Users,
} from './components/icons'

/**
 * The rail, and the argument the product makes about itself.
 *
 * The modules are ordered as the competitive loop runs:
 *
 *     PLAY -> ANALYZE -> UNDERSTAND -> ADAPT -> OUTPLAY
 *
 * Analyze (what happened, and what it says about you) comes before Matchup
 * (what that means against the next opponent), which comes before Compete
 * (going and doing it). Network and Passport are the ecosystem either side of
 * that loop - who else is out there, and what the loop has made of you.
 *
 * Adding a page means a route in `App.jsx` and an entry here.
 */
export const NAV_GROUPS = [
  {
    module: null,
    items: [
      { to: '/', label: 'Home', icon: Home, end: true },
      { to: '/passport', label: 'Passport', icon: IdCard, end: true },
    ],
  },
  {
    module: 'Analyze',
    items: [
      { to: '/analyze', label: 'Competitive DNA', icon: Dna, end: true },
      { to: '/analyze/matches', label: 'Match analysis', icon: Layers },
      { to: '/analyze/trends', label: 'Performance', icon: Trend },
      { to: '/analyze/vod', label: 'VOD intel', icon: Film },
      { to: '/analyze/condition', label: 'Condition', icon: Heart },
    ],
  },
  {
    module: 'Matchup',
    items: [
      { to: '/matchup', label: 'Next match', icon: Target, end: true },
      { to: '/matchup/opponents', label: 'Opponents', icon: Radar },
    ],
  },
  {
    module: 'Compete',
    items: [
      { to: '/compete/matches', label: 'Match centre', icon: Broadcast },
      { to: '/compete/tournaments', label: 'Tournaments', icon: Bracket },
      { to: '/compete/scrims', label: 'Scrims', icon: Calendar },
      { to: '/compete/setup', label: 'Setup check', icon: Gauge },
    ],
  },
  {
    module: 'Network',
    items: [
      { to: '/network', label: 'Players', icon: Users, end: true },
      { to: '/network/teams', label: 'Teams', icon: Target },
      { to: '/network/schools', label: 'Schools', icon: School },
      { to: '/network/orgs', label: 'Organizations', icon: Building },
      { to: '/network/talent', label: 'Talent', icon: Sparkle },
    ],
  },
]

// Mobile bottom tab bar - one tab per module. Passport is reachable from the
// top bar's avatar, which is where a profile lives on every phone app anyway.
export const MOBILE_TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/analyze', label: 'Analyze', icon: Dna, match: '/analyze' },
  { to: '/matchup', label: 'Matchup', icon: Target, match: '/matchup' },
  { to: '/compete/matches', label: 'Compete', icon: Broadcast, match: '/compete' },
  { to: '/network', label: 'Network', icon: Users, match: '/network' },
]
