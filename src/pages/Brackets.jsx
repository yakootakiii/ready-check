import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameTile from '../components/GameTile'
import LiveViewer from '../components/LiveViewer'
import Reveal from '../components/Reveal'
import { HudLabel, HudPageHeader, HudPanel, HudSection, LivePip } from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { ArrowRight, Bracket as BracketIcon, Search } from '../components/icons'
import { GAMES, GAMES_BY_ID, genreOf } from '../data/games'
import { bracketFor, circuitSummaryFor, eventsFor, liveMatchesFor } from '../data/generate'
import { formatPrize } from '../format'
import { tier as tierOf } from '../tiers'
import { useGame } from '../gameContext'

/* ---------------------------------------------------------------------------
   Level 1 — pick a title.
   --------------------------------------------------------------------------- */

function GamePicker() {
  const navigate = useNavigate()
  const { gameId, setGameId } = useGame()
  const [query, setQuery] = useState('')

  const games = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GAMES.filter(
      (g) => !q || g.name.toLowerCase().includes(q) || g.short.toLowerCase().includes(q),
    ).sort((a, b) => circuitSummaryFor(b.id).ongoing - circuitSummaryFor(a.id).ongoing)
  }, [query])

  // Choosing a title here also scopes the rest of the app, so the picker in
  // the top bar and this grid never disagree.
  const open = (id) => {
    setGameId(id)
    navigate(`/compete/brackets/${id}`)
  }

  return (
    <div>
      <HudPageHeader
        eyebrow="Circuit"
        title="Brackets"
        subtitle="Pick a title to see its running tournaments and the match on air right now."
      />

      <label className="mb-5 flex items-center gap-3 rounded-base border border-line bg-surface/85 px-3 py-2">
        <Search className="shrink-0 text-ink-muted" />
        <span className="sr-only">Search titles</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles"
          className="w-full bg-transparent text-body-m text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {games.map((game, i) => {
          const summary = circuitSummaryFor(game.id)
          const genre = genreOf(game)
          const selected = game.id === gameId
          return (
            <Reveal key={game.id} delay={Math.min(i, 12) * 45}>
              <HudPanel
                as="button"
                interactive
                glow={summary.ongoing ? 'ember' : 'signal'}
                onClick={() => open(game.id)}
                className={`h-full w-full p-5 text-left ${selected ? 'border-signal/70' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <GameTile game={game} size="l" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-display-m font-semibold text-ink">
                      {game.name}
                    </div>
                    <div className={`truncate text-body-s ${genre.text}`}>
                      {genre.label} · {game.platform} · {game.regions[0]}
                    </div>
                  </div>
                  {summary.ongoing > 0 && (
                    <span className="flex shrink-0 items-center gap-2 rounded-full border border-ember/60 px-2.5 py-0.5 text-body-s text-ember">
                      <LivePip />
                      {summary.ongoing}
                    </span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
                  <div>
                    <HudLabel>Running</HudLabel>
                    <div className="mt-1 font-mono text-mono-m text-ink">{summary.ongoing}</div>
                  </div>
                  <div>
                    <HudLabel>Upcoming</HudLabel>
                    <div className="mt-1 font-mono text-mono-m text-ink">{summary.upcoming}</div>
                  </div>
                  <div>
                    <HudLabel>Prize</HudLabel>
                    <div className="mt-1 font-mono text-mono-m text-signal">
                      {formatPrize(summary.prizeValue)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-body-s text-signal">
                  View tournaments
                  <ArrowRight />
                </div>
              </HudPanel>
            </Reveal>
          )
        })}
      </div>

      {games.length === 0 && (
        <EmptyState title="No title matches that search." hint="Try the short code, like MLBB." />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Level 2 — a title's live feed and its running tournaments.
   --------------------------------------------------------------------------- */

const STATUS = {
  live: { label: 'Running', className: 'border-ember/60 text-ember' },
  open: { label: 'Registration open', className: 'border-signal/60 text-signal' },
  soon: { label: 'Announced', className: 'border-line text-ink-muted' },
}

function GameCircuit({ game }) {
  const navigate = useNavigate()
  const matches = liveMatchesFor(game.id)
  const events = eventsFor(game.id)
  // The feed opens on the busiest match, which is what a viewer landing here
  // would have picked anyway.
  const [feedId, setFeedId] = useState(
    () => [...matches].sort((a, b) => b.viewers - a.viewers)[0].id,
  )
  const feed = matches.find((m) => m.id === feedId) ?? matches[0]

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow={`${genreOf(game).label} · ${game.platform}`}
        title={game.name}
        subtitle={`${events.filter((e) => e.status === 'live').length} tournaments running · ${
          matches.length
        } matches on air`}
        action={
          <Button onClick={() => navigate('/compete/brackets')}>Change title</Button>
        }
      />

      <Reveal>
        <section>
          <HudSection eyebrow="On air" title="Watch live" />
          <LiveViewer match={feed} others={matches} onSelect={setFeedId} />
        </section>
      </Reveal>

      <section>
        <HudSection
          eyebrow="Tournaments"
          title="Current events"
          action={
            <span className="text-body-s text-ink-muted">Open one to see its bracket</span>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {events.map((event, i) => {
            const running = event.status === 'live'
            return (
              <Reveal key={event.id} delay={i * 70}>
                <HudPanel
                  as="button"
                  interactive
                  glow={running ? 'ember' : 'signal'}
                  disabled={!running}
                  onClick={() => navigate(`/compete/brackets/${game.id}/${event.id}`)}
                  className={`h-full w-full p-5 text-left ${
                    running ? '' : 'cursor-default opacity-60'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-body-s ${
                      STATUS[event.status].className
                    }`}
                  >
                    {running && <LivePip />}
                    {STATUS[event.status].label}
                  </span>

                  <h3 className="mt-4 font-display text-display-m font-semibold leading-tight text-ink">
                    {event.name}
                  </h3>
                  <div className="mt-1 text-body-s text-ink-muted">
                    {event.window} · {event.venue}
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
                    <div>
                      <HudLabel>Prize</HudLabel>
                      <div className="mt-1 font-mono text-mono-m text-signal">{event.prize}</div>
                    </div>
                    <div className="text-right">
                      <HudLabel>Stage</HudLabel>
                      <div className="mt-1 font-mono text-mono-m text-ink">{event.stage}</div>
                    </div>
                  </div>

                  {running ? (
                    <div className="mt-4 flex items-center gap-2 text-body-s text-signal">
                      <BracketIcon />
                      {event.teamsRemaining} teams left
                      <ArrowRight />
                    </div>
                  ) : (
                    <div className="mt-4 text-body-s text-ink-muted">
                      Bracket opens when play starts
                    </div>
                  )}
                </HudPanel>
              </Reveal>
            )
          })}
        </div>
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Level 3 — one tournament's draw.
   --------------------------------------------------------------------------- */

function MatchCard({ match, game }) {
  const solo = game.teamSize === 1
  const sides = [
    { entrant: match.a, score: match.score[0], other: match.score[1] },
    { entrant: match.b, score: match.score[1], other: match.score[0] },
  ]

  return (
    <HudPanel corners={false} className="p-3">
      {sides.map((side) => {
        const won = match.done && side.score > side.other
        const t = tierOf(side.entrant.tier)
        return (
          <div key={side.entrant.id} className="flex items-center gap-3 py-1">
            <span aria-hidden="true" className={`h-6 w-0.5 shrink-0 ${won ? t.bg : 'bg-line'}`} />
            <span
              className={`min-w-0 flex-1 truncate text-body-m ${won ? 'text-ink' : 'text-ink-muted'}`}
            >
              {side.entrant.name}
              {solo && side.entrant.role && (
                <span className="text-body-s text-ink-muted"> · {side.entrant.role}</span>
              )}
            </span>
            <span className={`font-mono text-mono-m ${won ? 'text-ink' : 'text-ink-muted'}`}>
              {side.score}
            </span>
          </div>
        )
      })}
      {!match.done && (
        <div className="mt-2 flex items-center gap-2 border-t border-line pt-2 text-body-s text-ember">
          <LivePip />
          In progress
        </div>
      )}
    </HudPanel>
  )
}

function EventBracket({ game, event }) {
  const navigate = useNavigate()
  const rounds = bracketFor(game.id, event.id)
  const matches = liveMatchesFor(game.id)
  const feed = matches.find((m) => m.eventId === event.id) ?? matches[0]
  const [showFeed, setShowFeed] = useState(true)

  return (
    <div className="space-y-8">
      <HudPageHeader
        eyebrow={`${game.name} · ${event.stage}`}
        title={event.name}
        subtitle={`${event.window} · ${event.venue} · ${event.prize} prize pool`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowFeed((v) => !v)}>
              {showFeed ? 'Hide live feed' : 'Show live feed'}
            </Button>
            <Button onClick={() => navigate(`/compete/brackets/${game.id}`)}>
              All {game.short} events
            </Button>
          </div>
        }
      />

      {showFeed && (
        <Reveal>
          <LiveViewer match={feed} others={matches} onSelect={() => {}} />
        </Reveal>
      )}

      <section>
        <HudSection eyebrow="Draw" title="Bracket" />
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-6">
            {rounds.map((round, r) => (
              <div key={round.round} className="flex w-64 flex-col">
                <HudLabel className="mb-3">{round.round}</HudLabel>
                <ul className="flex flex-1 flex-col justify-around gap-4">
                  {round.matches.map((match, i) => (
                    <li key={match.id}>
                      <Reveal delay={r * 90 + i * 50}>
                        <MatchCard match={match} game={game} />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Prize pool', value: event.prize },
          { label: 'Field', value: `8 of ${event.teams}` },
          { label: 'Still in', value: `${event.teamsRemaining}` },
        ].map((stat, i) => (
          <Reveal key={stat.label} delay={i * 70}>
            <HudPanel className="p-4">
              <HudLabel>{stat.label}</HudLabel>
              <div className="mt-2 font-display text-display-l font-bold text-ink">
                {stat.value}
              </div>
            </HudPanel>
          </Reveal>
        ))}
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Router glue.
   --------------------------------------------------------------------------- */

export default function Brackets() {
  const { gameId, eventId } = useParams()
  const game = gameId ? GAMES_BY_ID[gameId] : null

  if (!game) return <GamePicker />

  if (eventId) {
    const event = eventsFor(game.id).find((e) => e.id === eventId)
    if (event) return <EventBracket game={game} event={event} />
  }

  return <GameCircuit game={game} />
}
