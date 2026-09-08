import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameTile from '../components/GameTile'
import NetworkTabs from '../components/NetworkTabs'
import Reveal from '../components/Reveal'
import { CoverageBadge } from '../components/CoverageNote'
import { HudLabel, HudPageHeader, HudPanel, StatBar } from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { ArrowRight, Search, Sparkle } from '../components/icons'
import { useGame } from '../gameContext'
import { GAMES_BY_ID, coverageKeyOf } from '../data/games'
import { playerDna } from '../data/dna'
import { trajectoryFor } from '../data/talent'
import { acrossGames, playersFor } from '../data/generate'
import { tier as tierOf } from '../tiers'

/**
 * The competitive graph, entered through its people.
 *
 * A ladder is the obvious way to list players and the least useful: it ranks
 * them against each other and describes none of them. So the rating stays -
 * it is real information - but the identity the model composed sits next to
 * the name, and the trajectory sits next to the rating, because "Adaptive
 * Aggressor, rising fast" is a row worth clicking and "2,410" is not.
 *
 * Identity is only shown where the model has something to say: on a title the
 * engine has not been calibrated on, the row falls back to role and rating
 * rather than inventing a profile.
 */
export default function NetworkPlayers() {
  const navigate = useNavigate()
  const { gameId, game, isAll } = useGame()
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState('rating')

  const rows = useMemo(() => {
    const base = isAll
      ? acrossGames(playersFor, { limit: 40, sortBy: (a, b) => b.rating - a.rating })
      : playersFor(gameId)

    const enriched = base.map((row) => {
      const modelled = coverageKeyOf(GAMES_BY_ID[row.gameId]) !== 'planned'
      const dna = modelled ? playerDna(row) : null
      return { ...row, dna, trajectory: dna ? trajectoryFor(dna) : null, modelled }
    })

    const sorted =
      order === 'rating'
        ? enriched
        : [...enriched].sort((a, b) => (b.trajectory?.drift ?? -99) - (a.trajectory?.drift ?? -99))

    const q = query.trim().toLowerCase()
    return q
      ? sorted.filter((row) =>
          `${row.name} ${row.team} ${row.role} ${row.dna?.identity ?? ''}`
            .toLowerCase()
            .includes(q),
        )
      : sorted
  }, [gameId, isAll, order, query])

  const topRating = rows[0]?.rating ?? 1

  return (
    <div>
      <NetworkTabs />

      <HudPageHeader
        eyebrow={isAll ? 'Every title' : game.name}
        title="Players"
        subtitle="Competitors on the platform, listed by who they are as well as where they rank."
        action={
          <span className="flex items-center gap-2 text-body-s text-ink-muted">
            {game && <GameTile game={game} size="s" />}
            {rows.length} listed
          </span>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex min-w-56 flex-1 items-center gap-3 rounded-base border border-line bg-surface/85 px-3 py-2">
          <Search className="shrink-0 text-ink-muted" />
          <span className="sr-only">Search players</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by handle, team, role or competitive identity"
            className="w-full bg-transparent text-body-m text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </label>
        <Button onClick={() => setOrder((v) => (v === 'rating' ? 'trajectory' : 'rating'))}>
          {order === 'rating' ? 'By rating' : 'By trajectory'}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/network/talent')}>
          <Sparkle />
          Talent intelligence
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No player matches that search." hint="Try a role, or a team name." />
      ) : (
        <HudPanel className="divide-y divide-line p-2">
          {rows.map((row, i) => {
            const t = tierOf(row.tier)
            const g = GAMES_BY_ID[row.gameId]
            return (
              <Reveal key={row.id} delay={Math.min(i, 10) * 45}>
                <button
                  type="button"
                  onClick={() => navigate(`/passport/${row.id}`)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-base px-3 py-3 text-left transition-colors duration-100 hover:bg-raised"
                >
                  <span className="w-6 shrink-0 font-display text-display-m font-bold text-ink-muted">
                    {i + 1}
                  </span>
                  <GameTile game={g} size="s" />

                  <span className="min-w-40 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="truncate font-display text-display-m font-semibold text-ink">
                        {row.name}
                      </span>
                      <span className="truncate text-body-s text-ink-muted">
                        {row.team} · {row.role}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-body-s text-signal">
                      {row.dna ? row.dna.identity : 'Not modelled on this title yet'}
                    </span>
                    <span className="mt-2 block">
                      <StatBar
                        pct={(row.rating / topRating) * 100}
                        color={t.bg}
                        delay={i * 45 + 180}
                      />
                    </span>
                  </span>

                  {/* Stat labels come from the title, never a fixed pair. */}
                  <span className="hidden w-28 text-right lg:block">
                    {row.stats.map((stat) => (
                      <span
                        key={stat.label}
                        className="block font-mono text-body-s text-ink-muted"
                      >
                        {stat.value} {stat.label}
                      </span>
                    ))}
                  </span>

                  <span className="w-24 text-right">
                    <span
                      className={`block text-body-s ${
                        row.trajectory?.tone === 'edge'
                          ? 'text-edge'
                          : row.trajectory?.tone === 'ember'
                            ? 'text-ember'
                            : 'text-ink-muted'
                      }`}
                    >
                      {row.trajectory ? row.trajectory.label : '—'}
                    </span>
                    <span className={`block text-body-s ${t.text}`}>{t.label}</span>
                  </span>

                  <span className="w-16 text-right">
                    <span className="block font-mono text-mono-l text-ink">{row.rating}</span>
                    <span
                      className={`block font-mono text-body-s ${
                        row.delta >= 0 ? 'text-edge' : 'text-ember'
                      }`}
                    >
                      {row.delta >= 0 ? '+' : ''}
                      {row.delta}
                    </span>
                  </span>
                </button>
              </Reveal>
            )
          })}
        </HudPanel>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <HudLabel>Model coverage</HudLabel>
          {game && <CoverageBadge game={game} />}
        </span>
        <Button variant="ghost" onClick={() => navigate('/network/teams')}>
          Teams in this scene
          <ArrowRight />
        </Button>
      </div>
    </div>
  )
}
