import GameTile from './GameTile'
import AngularPanel from './AngularPanel'
import { HudLabel, LivePip } from './hud'
import { Broadcast, Play } from './icons'
import { useTickingClock } from '../hooks'
import { formatClock } from '../format'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { tier as tierOf } from '../tiers'

/**
 * The live stage: a broadcast-style viewer for one in-progress match, with the
 * scoreline, a ticking clock and the round-by-round history laid over it.
 *
 * There is no real stream to embed, so the stage is a treated placeholder
 * rather than a fake player - it reads as "this is where the feed goes"
 * instead of pretending to be video.
 */
export default function LiveViewer({ match, others = [], onSelect }) {
  const seconds = useTickingClock(match.clock)
  const game = GAMES_BY_ID[match.gameId]
  const t = tierOf(match.tier)
  const leader = match.score[0] === match.score[1] ? -1 : match.score[0] > match.score[1] ? 0 : 1

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
      <AngularPanel accent="ember" fill="bg-surface/85" innerClassName="overflow-hidden">
        {/* Stage */}
        <div className="scanlines relative flex aspect-video items-center justify-center overflow-hidden bg-black">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse at 50% 40%, color-mix(in oklab, var(--color-ember) 30%, transparent) 0%, transparent 60%)',
            }}
          />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <Broadcast className="h-8 w-8 text-ember" />
            <div className="font-display text-display-m font-semibold text-ink">
              {match.sides[0]} vs. {match.sides[1]}
            </div>
            <div className="text-body-s text-ink-muted">
              {game.name} · {match.stageLabel}
            </div>
          </div>

          {/* Broadcast overlay: live badge and viewer count. */}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-base border border-ember/50 bg-base/70 px-2.5 py-1">
            <LivePip />
            <span className="hud-label text-ember">Live</span>
          </div>
          <div className="absolute right-4 top-4 rounded-base border border-line bg-base/70 px-2.5 py-1 font-mono text-mono-m text-ink">
            {(match.viewers / 1000).toFixed(1)}k
          </div>

          {/* Scoreboard, the way a tournament overlay sets one. */}
          <div className="absolute inset-x-0 bottom-0 flex items-stretch border-t border-line bg-base/85">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
              <span className={`h-8 w-1 shrink-0 ${t.bg}`} />
              <span
                className={`truncate font-display text-display-m font-semibold ${
                  leader === 0 ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {match.sides[0]}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-4 border-x border-line px-5 py-3">
              <span className="font-mono text-mono-l text-ink">{match.score[0]}</span>
              <span className="font-mono text-mono-m text-ink-muted">{formatClock(seconds)}</span>
              <span className="font-mono text-mono-l text-ink">{match.score[1]}</span>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-3 px-4 py-3">
              <span
                className={`truncate font-display text-display-m font-semibold ${
                  leader === 1 ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {match.sides[1]}
              </span>
              <span className={`h-8 w-1 shrink-0 ${t.bg}`} />
            </div>
          </div>
        </div>

        {/* Round history: who took each round, oldest first. */}
        <div className="border-t border-line p-4">
          <div className="flex items-center justify-between">
            <HudLabel>Round history</HudLabel>
            <span className="text-body-s text-ink-muted">{match.timeline.length} played</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {match.timeline.map((side, i) => (
              <span
                key={i}
                title={`Round ${i + 1} — ${match.sides[side === 'a' ? 0 : 1]}`}
                className={`h-6 w-2.5 rounded-[2px] ${side === 'a' ? 'bg-signal/70' : 'bg-ember/70'}`}
              />
            ))}
          </div>
        </div>
      </AngularPanel>

      {/* Other feeds from the same title. */}
      <div>
        <HudLabel className="mb-3">Also live · {game.short}</HudLabel>
        <div className="grid gap-3">
          {others.map((other) => (
            <button
              key={other.id}
              type="button"
              onClick={() => onSelect(other.id)}
              className={`group rounded-base border p-3 text-left transition-colors duration-150 ${
                other.id === match.id
                  ? 'border-ember/60 bg-raised'
                  : 'border-line bg-surface/85 hover:border-signal/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <LivePip />
                  <span className="hud-label text-ink-muted">{other.kind}</span>
                </span>
                <span className="font-mono text-body-s text-ink-muted">
                  {(other.viewers / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-body-m text-ink">
                  {other.sides[0]}
                </span>
                <span className="font-mono text-mono-m text-ink">{other.score[0]}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-body-m text-ink-muted">
                  {other.sides[1]}
                </span>
                <span className="font-mono text-mono-m text-ink-muted">{other.score[1]}</span>
              </div>
              {other.id !== match.id && (
                <span className="mt-2 flex items-center gap-1 text-body-s text-signal opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <Play />
                  Switch feed
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-base border border-line bg-surface/85 p-3">
          <HudLabel>Title</HudLabel>
          <div className="mt-2 flex items-center gap-2">
            <GameTile game={game} size="s" />
            <span className="min-w-0 flex-1 truncate text-body-m text-ink">{game.name}</span>
          </div>
          <div className={`mt-1 text-body-s ${genreOf(game).text}`}>
            {genreOf(game).label} · {game.platform} ·{' '}
            {game.teamSize === 1 ? 'Solo' : `${game.teamSize}v${game.teamSize}`}
          </div>
        </div>
      </div>
    </div>
  )
}
