import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameTile from '../components/GameTile'
import LiveViewer from '../components/LiveViewer'
import Reveal from '../components/Reveal'
import { HudLabel, HudPageHeader, HudPanel, HudSection, LivePip } from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { ArrowRight, Bracket as BracketIcon, Radar, Search, Target } from '../components/icons'
import { GAMES, GAMES_BY_ID, genreOf } from '../data/games'
import { bracketFor, circuitSummaryFor, eventsFor, liveMatchesFor } from '../data/generate'
import { bracketPathFor } from '../data/matchup'
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
    navigate(`/compete/tournaments/${id}`)
  }

  return (
    <div>
      <HudPageHeader
        eyebrow="Circuit"
        title="Tournaments"
        subtitle="Pick a title to see its running tournaments and the match on air right now."
      />

      <label className="mb-5 flex items-center gap-3 rounded-base border border-surface bg-surface px-3 py-2">
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
                className={`h-full w-full p-5 text-left ${selected ? 'border-signal' : ''}`}
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
                    <span className="flex shrink-0 items-center gap-2 rounded-full border border-ember px-2.5 py-0.5 text-body-s text-ember">
                      <LivePip />
                      {summary.ongoing}
                    </span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-surface pt-4">
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
  live: { label: 'Running', className: 'border-ember text-ember' },
  open: { label: 'Registration open', className: 'border-signal text-signal' },
  soon: { label: 'Announced', className: 'border-surface text-ink-muted' },
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
          <Button onClick={() => navigate('/compete/tournaments')}>Change title</Button>
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
                  onClick={() => navigate(`/compete/tournaments/${game.id}/${event.id}`)}
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

                  <div className="mt-5 flex items-end justify-between border-t border-surface pt-4">
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
            <span aria-hidden="true" className={`h-6 w-0.5 shrink-0 ${won ? t.bg : 'bg-surface'}`} />
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
        <div className="mt-2 flex items-center gap-2 border-t border-surface pt-2 text-body-s text-ember">
          <LivePip />
          In progress
        </div>
      )}
    </HudPanel>
  )
}

/**
 * Your route through this draw.
 *
 * A bracket already knows who you can meet in every round, so it is the one
 * place matchup intelligence runs forwards over a whole event rather than one
 * fixture at a time — which turns a results table into a plan: where the wall
 * is, and where the model thinks the run ends.
 *
 * Completed rounds show whether the model actually called them. A path that
 * projected forwards and never marked its own misses would be the half of the
 * loop this product exists to avoid.
 */
const LEG_TONE = {
  won: { label: 'Won', text: 'text-edge', rule: 'bg-edge' },
  lost: { label: 'Lost', text: 'text-ember', rule: 'bg-ember' },
  upcoming: { label: 'To play', text: 'text-signal', rule: 'bg-signal' },
}

function EventPath({ game, event }) {
  const navigate = useNavigate()
  const path = bracketPathFor(game.id, event.id)

  // Solo titles draw from the player pool, so there is no roster in the draw
  // and a team profile has nothing to say about it.
  if (!path) return null

  return (
    <section>
      <HudSection
        eyebrow="Path analysis"
        title={`${path.team.name}'s route`}
        action={
          <span className="text-body-s text-ink-muted">
            Model called{' '}
            <span className="font-mono text-mono-m text-ink">
              {path.called}/{path.played}
            </span>{' '}
            of the rounds played
          </span>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        {path.legs.map((leg, i) => {
          const tone = LEG_TONE[leg.result]
          const isWall = leg.id === path.hardest.id
          return (
            <Reveal key={leg.id} delay={i * 80}>
              <HudPanel
                as="button"
                interactive
                corners={false}
                glow={leg.result === 'lost' ? 'ember' : 'signal'}
                onClick={() => navigate(`/matchup/opponents/${leg.opponent.id}`)}
                className="flex h-full w-full gap-4 p-5 text-left"
              >
                <span aria-hidden="true" className={`w-0.5 shrink-0 rounded-full ${tone.rule}`} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <HudLabel>{leg.round}</HudLabel>
                    <span className={`hud-label ${tone.text}`}>{tone.label}</span>
                  </span>

                  <span className="mt-2 block truncate font-display text-display-m font-semibold text-ink">
                    vs. {leg.opponent.name}
                  </span>
                  <span className="mt-0.5 block truncate text-body-s text-signal">
                    {leg.dna.identity}
                  </span>

                  <span className="mt-4 flex items-baseline justify-between gap-3 border-t border-surface pt-3">
                    <span className="text-body-s text-ink-muted">
                      Model gave you{' '}
                      <span className="font-mono text-mono-m text-ink">
                        {leg.matchup.projection.winPct}%
                      </span>
                    </span>
                    <span className={`font-mono text-mono-m ${tone.text}`}>
                      {leg.result === 'upcoming' ? `${leg.score.join('–')} live` : leg.score.join('–')}
                    </span>
                  </span>

                  {leg.called === false && (
                    <span className="mt-2 block text-body-s text-ember">
                      The model called this one wrong. It has been fed back.
                    </span>
                  )}
                  {leg.result === 'upcoming' && leg.matchup.primaryConcern && (
                    <span className="mt-2 block text-body-s text-ink-muted">
                      Watch: {leg.matchup.primaryConcern.label.toLowerCase()} — they read{' '}
                      {leg.matchup.primaryConcern.them} against your{' '}
                      {leg.matchup.primaryConcern.you}.
                    </span>
                  )}
                  {isWall && path.legs.length > 1 && leg.result !== 'upcoming' && (
                    <span className="mt-2 block text-body-s text-ink-muted">
                      The hardest tie of the run on paper.
                    </span>
                  )}
                </span>
              </HudPanel>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={240}>
        <HudPanel className="mt-3 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="min-w-56 flex-1 text-body-m text-ink-muted">
            {path.status === 'eliminated' ? (
              <>
                Out in the {path.eliminatedIn.round.toLowerCase()} to{' '}
                <span className="text-ink">{path.eliminatedIn.opponent.name}</span>, who the
                model read as {path.eliminatedIn.dna.identity.toLowerCase()}.
              </>
            ) : (
              <>
                Still in. The wall on paper was the{' '}
                <span className="text-ink">{path.hardest.round.toLowerCase()}</span> against{' '}
                <span className="text-ink">{path.hardest.opponent.name}</span>, at{' '}
                {path.hardest.matchup.projection.winPct}%.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/matchup/opponents')}>
              <Radar />
              Scout the field
            </Button>
            {path.next && (
              <Button variant="primary" onClick={() => navigate('/matchup')}>
                <Target />
                Prepare the {path.next.round.toLowerCase()}
              </Button>
            )}
          </div>
        </HudPanel>
      </Reveal>
    </section>
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
            <Button onClick={() => navigate(`/compete/tournaments/${game.id}`)}>
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

      <EventPath game={game} event={event} />

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

export default function Tournaments() {
  const { gameId, eventId } = useParams()
  const game = gameId ? GAMES_BY_ID[gameId] : null

  if (!game) return <GamePicker />

  if (eventId) {
    const event = eventsFor(game.id).find((e) => e.id === eventId)
    if (event) return <EventBracket game={game} event={event} />
  }

  return <GameCircuit game={game} />
}
