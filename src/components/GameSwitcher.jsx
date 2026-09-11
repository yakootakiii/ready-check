import { useEffect, useMemo, useRef, useState } from 'react'
import { COVERAGE, GAMES, PLATFORMS, coverageKeyOf, genreOf } from '../data/games'
import { activityFor } from '../data/generate'
import { useGame } from '../gameContext'
import GameTile from './GameTile'
import { CoverageBadge } from './CoverageNote'
import { Search } from './icons'

/**
 * The title picker. It lives in the top bar because the selected game scopes
 * every module, so it has to be reachable from all of them.
 *
 * Every row states its model coverage. Coverage is declared on every screen
 * whose content depends on it, and the picker is the one place a reader
 * *chooses* that scope — finding out on the next screen that the title you just
 * selected has no behavioural model is exactly the surprise the coverage
 * grading exists to prevent.
 */
export default function GameSwitcher() {
  const { gameId, setGameId, game, isAll } = useGame()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = GAMES.filter(
      (g) =>
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.short.toLowerCase().includes(q) ||
        genreOf(g).label.toLowerCase().includes(q) ||
        COVERAGE[coverageKeyOf(g)].label.toLowerCase().includes(q) ||
        g.regions.some((r) => r.toLowerCase().includes(q)),
    )
    return PLATFORMS.map((platform) => ({
      platform,
      games: matches.filter((g) => g.platform === platform),
    })).filter((group) => group.games.length > 0)
  }, [query])

  // Ecosystem coverage is every title; behavioural coverage is not, and the
  // picker says which is which rather than implying they are the same.
  const modelledCount = GAMES.filter((g) => coverageKeyOf(g) !== 'planned').length

  const choose = (id) => {
    setGameId(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-base border border-surface bg-raised px-2.5 py-1.5 text-body-m text-ink transition-colors duration-100 hover:border-edge btn-press"
      >
        {game ? (
          <GameTile game={game} size="s" />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center border border-surface font-display text-body-s font-bold text-ink-muted"
            style={{ clipPath: 'polygon(22% 0, 100% 0, 100% 78%, 78% 100%, 0 100%, 0 22%)' }}
          >
            ALL
          </span>
        )}
        <span className="hidden max-w-40 truncate sm:inline">
          {game ? game.name : 'All games'}
        </span>
        <span aria-hidden="true" className="text-ink-muted">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a game"
          className="absolute right-0 z-30 mt-2 max-h-[70vh] w-[22rem] overflow-y-auto rounded-base border border-surface bg-raised p-2 shadow-glow-signal"
        >
          <label className="mb-2 flex items-center gap-2 rounded-base border border-surface bg-base px-2.5 py-2">
            <Search className="shrink-0 text-ink-muted" />
            <span className="sr-only">Search games</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, genre, region or coverage"
              className="w-full bg-transparent text-body-m text-ink placeholder:text-ink-muted focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => choose('all')}
            className={`flex w-full items-center gap-3 rounded-base px-2 py-2 text-left transition-colors duration-100 hover:bg-surface ${
              isAll ? 'text-ink' : 'text-ink-muted'
            }`}
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center border border-surface font-display text-body-s font-bold"
              style={{ clipPath: 'polygon(22% 0, 100% 0, 100% 78%, 78% 100%, 0 100%, 0 22%)' }}
            >
              ALL
            </span>
            <span className="flex-1">
              <span className="block text-body-m text-ink">All games</span>
              <span className="block text-body-s text-ink-muted">
                Everything across {GAMES.length} titles · {modelledCount} modelled
              </span>
            </span>
            {isAll && <span className="text-edge">●</span>}
          </button>

          {groups.map((group) => (
            <div key={group.platform} className="mt-2">
              <div className="hud-label px-2 py-1 text-ink-muted">{group.platform}</div>
              {group.games.map((g) => {
                const genre = genreOf(g)
                const activity = activityFor(g.id)
                const selected = g.id === gameId
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => choose(g.id)}
                    className="flex w-full items-center gap-3 rounded-base px-2 py-2 text-left transition-colors duration-100 hover:bg-surface btn-press"
                  >
                    <GameTile game={g} size="s" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-m text-ink">{g.name}</span>
                      <span className={`block text-body-s ${genre.text}`}>
                        {genre.label} · {g.teamSize === 1 ? 'Solo' : `${g.teamSize}v${g.teamSize}`} ·{' '}
                        <span className="font-mono text-ink-muted">{activity.live} live</span>
                      </span>
                    </span>
                    <CoverageBadge game={g} className="shrink-0" />
                    {selected && <span className="text-edge">●</span>}
                  </button>
                )
              })}
            </div>
          ))}

          {groups.length === 0 && (
            <p className="px-2 py-6 text-center text-body-m text-ink-muted">
              No title matches “{query}”.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
