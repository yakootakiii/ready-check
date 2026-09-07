import { NavLink, useNavigate } from 'react-router-dom'
import { useLiveMatch } from '../live'
import { player } from '../data/mock'
import { useGame } from '../gameContext'
import { GAMES_BY_ID } from '../data/games'
import { liveMatchesFor } from '../data/generate'
import { Bell, Menu } from './icons'
import GameSwitcher from './GameSwitcher'
import { formatClock } from '../format'

const TOP_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/overview', label: 'Overview' },
  { to: '/prep/scrims', label: 'Prep', match: '/prep' },
  { to: '/compete/live', label: 'Compete', match: '/compete' },
  { to: '/league', label: 'League', match: '/league' },
  { to: '/recruit/card', label: 'Recruit', match: '/recruit' },
]

export default function TopBar({ onToggleRail, railCollapsed = false }) {
  const { isLive } = useLiveMatch()
  const { game } = useGame()
  const navigate = useNavigate()

  const activeGame = game ?? GAMES_BY_ID[player.primaryGameId]
  const liveMatch = liveMatchesFor(activeGame.id)[0]

  return (
    <header className="z-20 shrink-0 border-b border-line bg-base/90">
      <div className="flex h-14 items-center gap-4 px-4">
        <button
          type="button"
          onClick={onToggleRail}
          aria-label={railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!railCollapsed}
          className="hidden rounded-base p-2 text-ink-muted transition-colors duration-100 hover:bg-raised hover:text-ink md:block"
        >
          <Menu
            className={`transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              railCollapsed ? 'rotate-90' : ''
            }`}
          />
        </button>

        <NavLink to="/" className="font-display text-display-m font-bold tracking-wide text-ink">
          Ready Check
        </NavLink>

        <nav aria-label="Modules" className="ml-4 hidden items-center gap-1 lg:flex">
          {TOP_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-base px-3 py-1.5 text-body-m transition-colors duration-100 ${
                  isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <GameSwitcher />
          <button
            type="button"
            aria-label="Notifications, 3 unread"
            className="relative rounded-base p-2 text-ink-muted transition-colors duration-100 hover:bg-raised hover:text-ink"
          >
            <Bell />
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-ember"
            />
          </button>
          <NavLink
            to="/recruit/card"
            aria-label={`Profile, ${player.fullName}`}
            className="flex h-8 w-8 items-center justify-center rounded-base border border-line bg-raised font-display text-body-m font-semibold text-ink"
          >
            KR
          </NavLink>
        </div>
      </div>

      {/* The one place a live match persists no matter which module you are in
          (spec §4). Slides in once on state change; the border settles after a
          few pulses rather than staying distracting. */}
      {isLive && (
        <div className="animate-live-strip-in border-t border-line bg-base px-4 py-1.5 md:p-0">
          {/* A persistent pill on mobile, a full-width strip from md up
              (spec §8). */}
          <button
            type="button"
            onClick={() => navigate('/compete/live')}
            className="flex w-full items-center gap-3 rounded-full border border-line bg-surface px-3 py-1.5 text-left transition-colors duration-100 hover:bg-raised md:rounded-none md:border-0 md:px-4"
          >
            <span className="flex shrink-0 items-center gap-2 text-body-s font-medium text-signal">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-signal" />
              Live
            </span>
            <span className="font-mono text-mono-m text-ink">
              {liveMatch.unitLabel} · {formatClock(liveMatch.clock)}
            </span>
            <span className="hidden text-body-s text-ink-muted sm:inline">
              vs. {liveMatch.sides[1]}
            </span>
            <span className="ml-auto shrink-0 text-body-s text-ink-muted">Jump to match</span>
          </button>
        </div>
      )}
    </header>
  )
}
