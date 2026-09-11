import { NavLink, useLocation } from 'react-router-dom'
import { MOBILE_TABS } from '../nav'

/**
 * On mobile the sidebar collapses to a bottom tab bar (spec §8).
 *
 * Its landmark label differs from the top bar's module nav: both are in the
 * DOM at once, and two identically labelled landmarks are ambiguous to a
 * screen reader even though only one is ever visible.
 */
export default function MobileTabBar() {
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Modules (bottom bar)"
      style={{ gridTemplateColumns: `repeat(${MOBILE_TABS.length}, minmax(0, 1fr))` }}
      className="fixed inset-x-0 bottom-0 z-20 grid border-t border-surface bg-surface md:hidden"
    >
      {MOBILE_TABS.map((tab) => {
        const active = tab.match ? pathname.startsWith(tab.match) : pathname === tab.to
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 py-2 text-body-s transition-colors duration-100 btn-press ${
              active ? 'text-signal' : 'text-ink-muted'
            }`}
          >
            
            <tab.icon />
            {tab.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
