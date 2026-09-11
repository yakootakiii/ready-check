import { NavLink } from 'react-router-dom'
import { Building, School, Sparkle, Target, Users } from './icons'

const TABS = [
  { to: '/network', label: 'Players', icon: Users, end: true },
  { to: '/network/teams', label: 'Teams', icon: Target },
  { to: '/network/schools', label: 'Schools', icon: School },
  { to: '/network/orgs', label: 'Organizations', icon: Building },
  { to: '/network/talent', label: 'Talent', icon: Sparkle },
]

/**
 * The Network module's top-level switch, shared by every screen under it.
 *
 * Players first: the ecosystem is a graph of competitors, and the other four
 * tabs are ways of grouping them. Talent sits last because it is the one tab
 * that asks a question of the graph rather than listing it.
 */
export default function NetworkTabs() {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-base border px-3 py-2 text-body-m transition-colors duration-150 ${
              isActive
                ? 'border-signal bg-raised text-ink'
                : 'border-surface bg-surface text-ink-muted hover:text-ink'
            }`
          }
        >
          <tab.icon />
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
