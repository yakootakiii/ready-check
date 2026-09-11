import { NavLink, useNavigate } from 'react-router-dom'
import { useLiveMatch } from '../live'
import { player } from '../data/mock'
import { useGame } from '../gameContext'
import { GAMES_BY_ID } from '../data/games'
import { liveMatchesFor } from '../data/generate'
import { Bell, Menu } from './icons'
import { LivePip } from './hud'
import GameSwitcher from './GameSwitcher'
import { formatClock } from '../format'

const TOP_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/analyze', label: 'Analyze', match: '/analyze' },
  { to: '/matchup', label: 'Matchup', match: '/matchup' },
  { to: '/compete/matches', label: 'Compete', match: '/compete' },
  { to: '/network', label: 'Network', match: '/network' },
]

export default function TopBar({ onToggleRail, railCollapsed = false }) {
  const { isLive } = useLiveMatch()
  const { game } = useGame()
  const navigate = useNavigate()

  const activeGame = game ?? GAMES_BY_ID[player.primaryGameId]
  const liveMatch = liveMatchesFor(activeGame.id)[0]

  return (
    <header className="z-20 shrink-0 border-b border-surface bg-base">
      <div className="flex h-14 items-center gap-4 px-4">
        <button
          type="button"
          onClick={onToggleRail}
          aria-label={railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!railCollapsed}
          className="hidden rounded-base p-2 text-ink-muted transition-colors duration-100 hover:bg-raised hover:text-ink md:block btn-press"
        >
          <Menu
            className={`transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              railCollapsed ? 'rotate-90' : ''
            }`}
          />
        </button>

        {/* The wordmark is set in caps and tracked tight: it is the one place
            besides the home hero where the brand shouts, and it has to hold
            its own beside a rail of twelve labels. */}
        <NavLink
          to="/"
          className="font-display text-display-m font-bold uppercase tracking-[0.12em] text-ink"
        >
          Outplay
        </NavLink>

        <nav aria-label="Modules" className="ml-4 hidden items-center gap-1 lg:flex">
          {TOP_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-base px-3 py-1.5 text-body-m transition-colors duration-100 ${
                  isActive ? 'text-ember' : 'text-ink-muted hover:text-ember'
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
            className="relative rounded-base p-2 text-ink-muted transition-colors duration-100 hover:bg-raised hover:text-ink btn-press"
          >
            <Bell />
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-signal"
            />
          </button>
          <NavLink
            to="/passport"
            aria-label={`Competitive passport, ${player.fullName}`}
            className="flex h-8 w-8 items-center justify-center rounded-base border border-surface bg-raised font-display text-body-m font-semibold text-ink btn-press"
          >
            KR
          </NavLink>
        </div>
      </div>

      {/* The one place a live match persists no matter which module you are in
          Slides in once on state change and then sits quiet - a strip that
          kept pulsing for the next two hours of play would be noise. */}
      {isLive && (
        <div className="animate-live-strip-in border-t border-surface bg-base px-4 py-1.5 md:p-0">
          {/* A persistent pill on mobile, a full-width strip from md up
              (spec §8). */}
          <button
            type="button"
            onClick={() => navigate('/compete/matches')}
            className="flex w-full items-center gap-3 rounded-full border border-surface bg-surface px-3 py-1.5 text-left transition-colors duration-100 hover:bg-raised md:rounded-none md:border-0 md:px-4"
          >
            <span className="flex shrink-0 items-center gap-2 text-body-s font-medium text-edge">
              <LivePip className="text-edge" />
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
