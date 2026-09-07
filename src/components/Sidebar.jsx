import { NavLink } from 'react-router-dom'
import { NAV_GROUPS } from '../nav'

/**
 * The desktop rail.
 *
 * Collapsing animates the width while labels fade and slide out; the icons
 * keep a constant x-position rather than re-centring, so the two states read as
 * the same rail narrowing rather than two different layouts swapping.
 *
 * Labels stay mounted at `opacity: 0` instead of being removed — they are the
 * accessible name for each link, and dropping them would leave a rail of
 * unlabelled icons for a screen reader.
 */
export default function Sidebar({ collapsed }) {
  return (
    <nav
      aria-label="Sections"
      className={`hidden shrink-0 overflow-y-auto overflow-x-hidden border-r border-line bg-surface/85 py-4 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:block ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {NAV_GROUPS.map((group, i) => (
        <div key={group.module ?? 'root'} className={i > 0 ? 'mt-4 border-t border-line pt-4' : ''}>
          {group.module && (
            // Height collapses too, so the groups keep their rhythm instead of
            // leaving invisible gaps in the narrow rail.
            <div
              aria-hidden={collapsed}
              className={`overflow-hidden whitespace-nowrap px-4 text-body-s text-ink-muted transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                collapsed ? 'h-0 opacity-0' : 'h-6 opacity-100'
              }`}
            >
              {group.module}
            </div>
          )}
          <ul>
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    [
                      // Active row gets a signal left border, not a filled
                      // background - keeps the rail quiet (spec §4).
                      'flex items-center gap-3 border-l-2 px-4 py-2 text-body-m transition-colors duration-100',
                      isActive
                        ? 'border-signal text-ink'
                        : 'border-transparent text-ink-muted hover:text-ink',
                    ].join(' ')
                  }
                >
                  <item.icon className="shrink-0" />
                  <span
                    className={`whitespace-nowrap transition-[opacity,transform] duration-200 ease-out ${
                      collapsed ? '-translate-x-1 opacity-0' : 'translate-x-0 opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
