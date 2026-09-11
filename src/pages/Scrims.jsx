import { useMemo, useState } from 'react'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import { HudLabel, HudPageHeader, HudPanel, LivePip } from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { ArrowRight } from '../components/icons'
import { acrossGames, openScrimsFor } from '../data/generate'
import { nextFixture, sparringLikeness } from '../data/matchup'
import { player } from '../data/mock'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { tier as tierOf } from '../tiers'
import { useGame } from '../gameContext'

function ScrimRow({ scrim, showGame, requested, onRequest, delay, likeness }) {
  const game = GAMES_BY_ID[scrim.gameId]
  const t = tierOf(scrim.tier)
  const filled = scrim.capacity - scrim.slots

  return (
    <Reveal
      delay={delay}
      className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-surface px-4 py-3 transition-colors duration-100 last:border-b-0 hover:bg-raised"
    >
      {scrim.open ? (
        <LivePip className="text-signal" />
      ) : (
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-surface" />
      )}
      {showGame && <GameTile game={game} size="s" />}

      <div className="min-w-44 flex-1">
        <div className="text-body-m text-ink">{scrim.team}</div>
        {/* The reason to take this scrim over another one: how closely this
            side's Competitive DNA resembles the team you play next. */}
        {likeness && likeness.similarity >= 55 ? (
          <div className="text-body-s text-signal">
            Plays like {likeness.target.name} · {likeness.similarity}% style match
          </div>
        ) : (
          <div className="text-body-s text-ink-muted">{scrim.window}</div>
        )}
      </div>

      {/* One pip per roster seat, so a 3v3 title reads as three. */}
      <div className="flex w-24 items-center gap-1">
        {Array.from({ length: scrim.capacity }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`h-1.5 flex-1 rounded-full ${i < filled ? 'bg-signal' : 'bg-raised'}`}
          />
        ))}
      </div>
      <span className="w-20 text-body-s text-ink-muted">
        {scrim.slots} of {scrim.capacity}
      </span>

      <span className={`w-24 text-body-m ${t.text}`}>{t.label}</span>
      <span className="w-20 text-body-m text-ink-muted">{scrim.region}</span>
      <span className="w-12 font-mono text-mono-m text-ink-muted">{scrim.format}</span>

      <Button
        variant={requested ? 'ghost' : 'secondary'}
        disabled={requested}
        onClick={() => onRequest(scrim.id)}
        className="ml-auto"
      >
        {requested ? 'Request sent' : 'Request scrim'}
      </Button>
    </Reveal>
  )
}

/**
 * The scrim finder, with one thing added that changes what it is for.
 *
 * A scrim board normally sorts by rank and availability. Outplay can do
 * something a board cannot: rank the offers by how closely each side's
 * Competitive DNA resembles the team you actually play next, so a practice
 * block is preparation rather than volume. That ordering is the default here,
 * and the reason is printed on every row.
 */
export default function Scrims() {
  const { gameId, game, isAll } = useGame()
  const [requested, setRequested] = useState([])
  const [openOnly, setOpenOnly] = useState(false)
  const [byLikeness, setByLikeness] = useState(true)

  const activeId = game ? game.id : player.primaryGameId
  const fixture = nextFixture(activeId)

  const scrims = useMemo(() => {
    const rows = isAll ? acrossGames(openScrimsFor, { limit: 14 }) : openScrimsFor(gameId)
    const withLikeness = rows.map((scrim) => ({
      ...scrim,
      likeness: sparringLikeness(scrim.gameId, scrim.team),
    }))
    return byLikeness
      ? [...withLikeness].sort(
          (a, b) => (b.likeness?.similarity ?? -1) - (a.likeness?.similarity ?? -1),
        )
      : withLikeness
  }, [gameId, isAll, byLikeness])

  const visible = openOnly ? scrims.filter((s) => s.open) : scrims
  const openCount = scrims.filter((s) => s.open).length

  // Filters reflect the selected title: rank ranges, regions and roster size
  // are not universal.
  const filters = [
    { label: 'Game', value: game ? game.name : 'All titles' },
    { label: 'Rank', value: 'Gold–Diamond' },
    { label: 'Region', value: game ? game.regions.slice(0, 2).join(' / ') : 'Worldwide' },
    {
      label: 'Format',
      value: game ? (game.teamSize === 1 ? 'Solo' : `${game.teamSize}v${game.teamSize}`) : 'Any',
    },
  ]

  return (
    <div>
      <HudPageHeader
        eyebrow={game ? genreOf(game).label : 'Every title'}
        title="Scrims"
        subtitle={`Ordered by how closely each side plays like ${fixture.opponent.name}, your next opponent.`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-body-s text-ink-muted">
              <LivePip className="text-edge" />
              {openCount} open now
            </span>
            <Button onClick={() => setByLikeness((v) => !v)}>
              {byLikeness ? 'By style match' : 'By listing order'}
            </Button>
            <Button onClick={() => setOpenOnly((v) => !v)}>
              {openOnly ? 'Showing open only' : 'Show open only'}
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {game && <GameTile game={game} size="s" />}
        {filters.map((filter) => (
          <span
            key={filter.label}
            className="rounded-base border border-surface bg-surface px-3 py-1.5 text-body-m"
          >
            <span className="hud-label inline text-ink-muted">{filter.label}</span>{' '}
            <span className="text-ink">{filter.value}</span>
          </span>
        ))}
        <span className="flex items-center gap-1 text-body-s text-ink-muted">
          Change the title from the top bar
          <ArrowRight />
        </span>
      </div>

      <HudPanel className="overflow-hidden">
        {visible.length > 0 ? (
          <div>
            {visible.map((scrim, i) => (
              <ScrimRow
                key={scrim.id}
                scrim={scrim}
                showGame={isAll}
                delay={Math.min(i, 10) * 45}
                likeness={scrim.likeness}
                requested={requested.includes(scrim.id)}
                onRequest={(id) => setRequested((list) => [...list, id])}
              />
            ))}
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No teams match these filters."
              hint="Widen the rank range or check back closer to your usual scrim window."
            />
          </div>
        )}
      </HudPanel>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <HudLabel>
          {visible.length} of {scrims.length} listings shown
        </HudLabel>
        <span className="text-body-s text-ink-muted">
          Style match compares a side's Competitive DNA with {fixture.opponent.name}'s across all
          twelve dimensions. A high number means the practice transfers.
        </span>
      </div>
    </div>
  )
}
