import {
  Home,
  Grid,
  Calendar,
  Film,
  Heart,
  Bracket,
  Broadcast,
  Gauge,
  IdCard,
  Search,
  Users,
  School,
  Building,
} from './components/icons'

// Groups match the left rail in spec §4: Overview, then Prep, Compete, Recruit.
export const NAV_GROUPS = [
  {
    module: null,
    items: [
      { to: '/', label: 'Home', icon: Home, end: true },
      { to: '/overview', label: 'Overview', icon: Grid },
    ],
  },
  {
    module: 'Prep',
    items: [
      { to: '/prep/scrims', label: 'Scrims', icon: Calendar },
      { to: '/prep/vod', label: 'VOD', icon: Film },
      { to: '/prep/wellness', label: 'Wellness', icon: Heart },
    ],
  },
  {
    module: 'Compete',
    items: [
      { to: '/compete/brackets', label: 'Brackets', icon: Bracket },
      { to: '/compete/live', label: 'Live', icon: Broadcast },
      { to: '/compete/diagnostics', label: 'Diagnostics', icon: Gauge },
    ],
  },
  {
    module: 'League',
    items: [
      { to: '/league', label: 'Teams', icon: Users, end: true },
      { to: '/league/schools', label: 'Schools', icon: School },
      { to: '/league/orgs', label: 'Organizations', icon: Building },
    ],
  },
  {
    module: 'Recruit',
    items: [
      { to: '/recruit/card', label: 'My card', icon: IdCard },
      { to: '/recruit/orgs', label: 'Org search', icon: Search },
    ],
  },
]

// Mobile bottom tab bar - one tab per module (spec §8).
export const MOBILE_TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/prep/scrims', label: 'Prep', icon: Calendar, match: '/prep' },
  { to: '/compete/live', label: 'Compete', icon: Broadcast, match: '/compete' },
  { to: '/league', label: 'League', icon: Users, match: '/league' },
  { to: '/recruit/card', label: 'Recruit', icon: IdCard, match: '/recruit' },
]
