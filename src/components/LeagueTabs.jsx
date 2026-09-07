import { NavLink } from 'react-router-dom'
import { Building, School, Users } from './icons'

const TABS = [
  { to: '/league', label: 'Teams', icon: Users, end: true },
  { to: '/league/schools', label: 'Schools', icon: School },
  { to: '/league/orgs', label: 'Organizations', icon: Building },
]

/** The League module's top-level switch, shared by every screen under it. */
export default function LeagueTabs() {
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
                ? 'border-signal/70 bg-raised text-ink'
                : 'border-line bg-surface/60 text-ink-muted hover:text-ink'
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
