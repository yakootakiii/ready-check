import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AngularPanel from '../components/AngularPanel'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import {
  AnimatedNumber,
  Countdown,
  HudLabel,
  HudPanel,
  LivePip,
  StatBar,
  Ticker,
} from '../components/hud'
import { Button } from '../components/ui'
import { ArrowRight, Broadcast, Calendar, Play, Search } from '../components/icons'
import { useCarousel, useTickingClock } from '../hooks'
import { formatClock } from '../format'
import { tier as tierOf } from '../tiers'
import { useGame } from '../gameContext'
import { GAMES, GAMES_BY_ID, genreOf } from '../data/games'
import {
  acrossGames,
  activityFor,
  eventsFor,
  liveMatchesFor,
  newsFor,
  openScrimsFor,
  playersFor,
  teamsFor,
} from '../data/generate'

const STATUS = {
  live: { label: 'Live', className: 'border-ember/60 text-ember' },
  open: { label: 'Registration open', className: 'border-signal/60 text-signal' },
  soon: { label: 'Announced', className: 'border-line text-ink-muted' },
}

/** Every list on this page comes from one title or from all of them. */
function useHubData(gameId, isAll) {
  return useMemo(() => {
    const take = (generator, limit, sortBy) =>
      isAll ? acrossGames(generator, { limit, sortBy }) : generator(gameId).slice(0, limit)

    return {
      live: take(liveMatchesFor, 3, (a, b) => b.viewers - a.viewers),
      scrims: take(openScrimsFor, 4, (a, b) => a.slots - b.slots),
      events: take(eventsFor, 4, (a, b) => b.prizeValue - a.prizeValue),
      players: take(playersFor, 5, (a, b) => b.rating - a.rating),
      teams: take(teamsFor, 5, (a, b) => b.streak - a.streak),
      news: take(newsFor, 4),
    }
  }, [gameId, isAll])
}

function gameOf(row) {
  return GAMES_BY_ID[row.gameId]
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <HudLabel className="text-signal">{eyebrow}</HudLabel>
        <h2 className="mt-1 font-display text-display-l font-bold tracking-tight text-ink">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

/** Marks which title a row belongs to. Essential in the "All games" view. */
function GameStamp({ game, className = '' }) {
  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      <GameTile game={game} size="s" />
      <span className="truncate text-body-s text-ink-muted">{game.short}</span>
    </span>
  )
}

function LiveMatchCard({ match, delay }) {
  const seconds = useTickingClock(match.clock)
  const game = gameOf(match)
  const t = tierOf(match.tier)

  return (
    <Reveal delay={delay}>
      <HudPanel interactive glow="ember" className="scanlines h-full overflow-hidden p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-ember">
            <LivePip />
            <span className="hud-label truncate text-ember">Live · {match.kind}</span>
          </span>
          <span className="font-mono text-mono-m text-ink-muted">{formatClock(seconds)}</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate font-display text-display-m font-semibold text-ink">
              {match.sides[0]}
            </div>
            <div className="truncate font-display text-display-m font-semibold text-ink-muted">
              {match.sides[1]}
            </div>
          </div>
          <div className="text-right font-mono text-mono-l text-ink">
            <div>{match.score[0]}</div>
            <div className="text-ink-muted">{match.score[1]}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <GameStamp game={game} />
          <span className="shrink-0 text-body-s text-ink-muted">{match.unitLabel}</span>
          <span className={`shrink-0 text-body-s ${t.text}`}>{t.label}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-mono-m text-ink-muted">
            {(match.viewers / 1000).toFixed(1)}k watching
          </span>
          <Button variant="ghost" className="px-2 py-1">
            <Play />
            Watch
          </Button>
        </div>
      </HudPanel>
    </Reveal>
  )
}

function BrowseGames({ onPick, activeId }) {
  return (
    <section>
      <SectionHeading
        eyebrow={`${GAMES.length} titles`}
        title="Browse by game"
        action={<span className="text-body-s text-ink-muted">PC · Mobile · Console</span>}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {GAMES.map((game, i) => {
          const genre = genreOf(game)
          const activity = activityFor(game.id)
          const active = game.id === activeId
          return (
            <Reveal key={game.id} delay={Math.min(i, 12) * 40}>
              <HudPanel
                as="button"
                interactive
                corners={false}
                onClick={() => onPick(game.id)}
                className={`flex w-full items-center gap-3 p-3 text-left ${
                  active ? 'border-signal/70' : ''
                }`}
              >
                <GameTile game={game} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-m text-ink">{game.name}</span>
                  <span className={`block truncate text-body-s ${genre.text}`}>
                    {genre.label} · {game.platform} · {game.regions[0]}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="flex items-center justify-end gap-1.5 font-mono text-body-s text-ember">
                    <LivePip />
                    {activity.live}
                  </span>
                  <span className="block font-mono text-body-s text-ink-muted">
                    {activity.scrims}
                  </span>
                </span>
              </HudPanel>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}


const HERO_DWELL_MS = 7000

/**
 * The featured-event hero. With more than one slide it rotates on a timer and
 * exposes the rotation as a row of title tabs - which doubles as a readout of
 * the five busiest scenes, and gives the reader a way to stop and steer it.
 */
function FeaturedHero({ slides }) {
  const navigate = useNavigate()
  const [paused, setPaused] = useState(false)
  const { index, setIndex } = useCarousel(slides.length, {
    interval: HERO_DWELL_MS,
    paused,
  })

  const event = slides[index]
  const game = GAMES_BY_ID[event.gameId]
  const rotating = slides.length > 1

  return (
    <Reveal
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <AngularPanel
        accent="signal"
        fill="bg-surface/85"
        innerClassName="sheen-run scanlines relative overflow-hidden p-6 md:p-10"
      >
        {/* Keyed on the slide so the swap animation replays each rotation. */}
        <div key={event.id} className="animate-hero-swap">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-2xl">
              <span className="flex flex-wrap items-center gap-3">
                <GameTile game={game} size="s" />
                <HudLabel className="text-ember">Featured event · {game.name}</HudLabel>
              </span>

              <h1 className="mt-3 font-display text-[clamp(2.25rem,5.5vw,4rem)] font-bold uppercase leading-[0.95] tracking-tight text-ink">
                {event.name}
              </h1>
              <p className="mt-2 text-body-l text-ink-muted">
                {event.window} · {event.venue} · {genreOf(game).label}
              </p>

              <div className="mt-6 flex flex-wrap gap-8">
                <div>
                  <HudLabel>Prize pool</HudLabel>
                  <div className="mt-1 font-mono text-mono-l text-signal">{event.prize}</div>
                </div>
                <div>
                  <HudLabel>Teams</HudLabel>
                  <div className="mt-1 font-mono text-mono-l text-ink">
                    <AnimatedNumber value={event.teams} />
                  </div>
                </div>
                <div>
                  <HudLabel>Format</HudLabel>
                  <div className="mt-1 font-mono text-mono-l text-ink">
                    {game.teamSize === 1 ? 'Solo' : `${game.teamSize}v${game.teamSize}`}
                  </div>
                </div>
                <div>
                  <HudLabel>Region</HudLabel>
                  <div className="mt-1 font-mono text-mono-l text-ink">{event.region}</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => navigate('/compete/live')}>
                  <Broadcast />
                  Watch the final
                </Button>
                <Button onClick={() => navigate('/compete/brackets')}>
                  View bracket
                  <ArrowRight />
                </Button>
              </div>
            </div>

            <div className="shrink-0">
              <HudLabel className="mb-2">Starts in</HudLabel>
              <Countdown key={event.id} seconds={event.startsInSeconds} />
            </div>
          </div>
        </div>

        {rotating && (
          <div className="mt-8 border-t border-line pt-4">
            <div className="mb-2 flex items-center justify-between">
              <HudLabel>Busiest scenes</HudLabel>
              <span className="text-body-s text-ink-muted">
                {paused ? 'Paused' : `${index + 1} of ${slides.length}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {slides.map((slide, i) => {
                const g = GAMES_BY_ID[slide.gameId]
                const active = i === index
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={active ? 'true' : undefined}
                    title={`${g.name} — ${activityFor(g.id).live} live`}
                    aria-label={`Show ${g.name}`}
                    className={`relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-base border px-2 py-2 transition-colors duration-150 sm:justify-start sm:px-3 sm:text-left ${
                      active
                        ? 'border-signal/70 bg-raised text-ink'
                        : 'border-line bg-surface/60 text-ink-muted hover:text-ink'
                    }`}
                  >
                    <GameTile game={g} size="s" />
                    {/* Below sm there is no room for a legible label, so the
                        strip becomes a row of monograms rather than five
                        columns of ellipses. */}
                    <span className="hidden min-w-0 flex-1 sm:block">
                      <span className="block truncate text-body-s">{g.short}</span>
                      <span className="block truncate text-body-s text-ink-muted">
                        {activityFor(g.id).live} live
                      </span>
                    </span>
                    {/* Dwell indicator; keyed so it restarts with the slide. */}
                    {active && !paused && (
                      <span
                        key={`${slide.id}-dwell`}
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-signal"
                        style={{ animation: `dwell ${HERO_DWELL_MS}ms linear both` }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </AngularPanel>
    </Reveal>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { gameId, setGameId, game, isAll } = useGame()
  const data = useHubData(gameId, isAll)

  const maxRating = data.players[0]?.rating ?? 1

  // In all-titles mode the hero rotates through the five busiest scenes, so
  // the landing surface represents the platform rather than whichever game
  // happens to sort first. A single selected title has one hero.
  const featured = useMemo(() => {
    const pickEvent = (id) => {
      const list = eventsFor(id)
      return list.find((e) => e.status === 'live') ?? list[0]
    }
    if (!isAll) return [pickEvent(gameId)]
    return [...GAMES]
      .sort((a, b) => activityFor(b.id).live - activityFor(a.id).live)
      .slice(0, 5)
      .map((g) => pickEvent(g.id))
  }, [gameId, isAll])
  const scopeLabel = game ? game.name : 'every title'

  const ticker = useMemo(() => {
    const rows = isAll
      ? acrossGames(liveMatchesFor, { limit: 8, sortBy: (a, b) => b.viewers - a.viewers })
      : liveMatchesFor(gameId)
    return rows.map((m) => ({
      id: m.id,
      short: GAMES_BY_ID[m.gameId].short,
      label: `${m.sides[0]} ${m.score[0]} — ${m.score[1]} ${m.sides[1]}`,
    }))
  }, [gameId, isAll])

  const platformStats = useMemo(() => {
    const ids = isAll ? GAMES.map((g) => g.id) : [gameId]
    const totals = ids.reduce(
      (acc, id) => {
        const a = activityFor(id)
        acc.live += a.live
        acc.scrims += a.scrims
        acc.players += a.players
        return acc
      },
      { live: 0, scrims: 0, players: 0 },
    )
    const prize = (isAll ? acrossGames(eventsFor) : eventsFor(gameId)).reduce(
      (sum, e) => sum + e.prizeValue,
      0,
    )
    return [
      { id: 'live', label: 'Live matches', value: totals.live },
      { id: 'scrims', label: 'Scrims today', value: totals.scrims },
      { id: 'players', label: 'Players online', value: totals.players / 1000, decimals: 1, suffix: 'k' },
      { id: 'titles', label: isAll ? 'Titles covered' : 'Prize pool tracked',
        value: isAll ? GAMES.length : prize / 1000000, decimals: isAll ? 0 : 1,
        suffix: isAll ? '' : 'M' },
    ]
  }, [gameId, isAll])

  return (
    <div className="space-y-12">
      {/* Score ticker ------------------------------------------------------ */}
      <Ticker className="-mx-4 border-y border-line bg-surface/50 py-2 md:-mx-6">
        {ticker.map((item) => (
          <span key={item.id} className="flex items-center gap-2 px-6">
            <LivePip />
            <span className="hud-label text-ink-muted">{item.short}</span>
            <span className="whitespace-nowrap text-body-m text-ink">{item.label}</span>
          </span>
        ))}
      </Ticker>

      {/* Hero -------------------------------------------------------------- */}
      <FeaturedHero slides={featured} />

      {/* Platform stats ---------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {platformStats.map((stat, i) => (
          <Reveal key={stat.id} delay={i * 70}>
            <HudPanel interactive className="p-4">
              <HudLabel>{stat.label}</HudLabel>
              <div className="mt-2 font-display text-display-xl font-bold text-ink">
                <AnimatedNumber
                  value={stat.value}
                  decimals={stat.decimals ?? 0}
                  suffix={stat.suffix ?? ''}
                />
              </div>
            </HudPanel>
          </Reveal>
        ))}
      </div>

      {/* Live now ---------------------------------------------------------- */}
      <section>
        <SectionHeading
          eyebrow={`Happening right now · ${scopeLabel}`}
          title="Live matches"
          action={
            <Button variant="ghost" onClick={() => navigate('/compete/live')}>
              All matches
              <ArrowRight />
            </Button>
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {data.live.map((match, i) => (
            <LiveMatchCard key={match.id} match={match} delay={i * 90} />
          ))}
        </div>
      </section>

      {/* Open scrims ------------------------------------------------------- */}
      <section>
        <SectionHeading
          eyebrow="Fill a slot"
          title="Open scrims"
          action={
            <Button variant="ghost" onClick={() => navigate('/prep/scrims')}>
              <Search />
              Scrim finder
            </Button>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.scrims.map((scrim, i) => {
            const t = tierOf(scrim.tier)
            const g = gameOf(scrim)
            return (
              <Reveal key={scrim.id} delay={i * 70}>
                <HudPanel interactive className="group h-full p-4">
                  <div className="flex items-center justify-between gap-2">
                    <GameStamp game={g} />
                    <span className="font-mono text-mono-m text-ink-muted">{scrim.format}</span>
                  </div>
                  <div className="mt-3 font-display text-display-m font-semibold text-ink">
                    {scrim.team}
                  </div>
                  <div className="mt-1 text-body-s text-ink-muted">
                    Starts {scrim.starts} · <span className={t.text}>{t.label}</span> · {scrim.region}
                  </div>

                  {/* One pip per roster seat, so a 3v3 title reads as 3. */}
                  <div className="mt-4 flex items-center gap-1.5">
                    {Array.from({ length: scrim.capacity }, (_, slot) => (
                      <span
                        key={slot}
                        aria-hidden="true"
                        className={`h-1.5 flex-1 rounded-full ${
                          slot < scrim.capacity - scrim.slots ? 'bg-signal' : 'bg-raised'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-body-s text-ink-muted">
                      {scrim.slots} of {scrim.capacity} open
                    </span>
                    <span className="text-body-s text-signal opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Request →
                    </span>
                  </div>
                </HudPanel>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Browse by game ---------------------------------------------------- */}
      <BrowseGames onPick={setGameId} activeId={gameId} />

      {/* Events ------------------------------------------------------------ */}
      <section>
        <SectionHeading
          eyebrow="Circuit"
          title="Current events"
          action={
            <Button variant="ghost" onClick={() => navigate('/compete/brackets')}>
              <Calendar />
              Full calendar
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.events.map((event, i) => (
            <Reveal key={event.id} delay={i * 80}>
              <HudPanel
                interactive
                glow={event.status === 'live' ? 'ember' : 'signal'}
                className="h-full p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-body-s ${
                      STATUS[event.status].className
                    }`}
                  >
                    {event.status === 'live' && <LivePip />}
                    {STATUS[event.status].label}
                  </span>
                  <GameTile game={gameOf(event)} size="s" />
                </div>

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
                    <HudLabel>Teams</HudLabel>
                    <div className="mt-1 font-mono text-mono-m text-ink">{event.teams}</div>
                  </div>
                  <div className="text-right">
                    <HudLabel>Region</HudLabel>
                    <div className="mt-1 font-mono text-mono-m text-ink">{event.region}</div>
                  </div>
                </div>
              </HudPanel>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Top players + top teams ------------------------------------------- */}
      <div className="grid gap-8 xl:grid-cols-2">
        <section>
          <SectionHeading
            eyebrow="Ladder"
            title={isAll ? 'Top players, all titles' : 'Top players'}
          />
          <HudPanel className="divide-y divide-line p-2">
            {data.players.map((p, i) => {
              const t = tierOf(p.tier)
              const g = gameOf(p)
              return (
                <Reveal key={p.id} delay={i * 70} className="flex items-center gap-4 px-3 py-3">
                  <span className="w-6 font-display text-display-m font-bold text-ink-muted">
                    {i + 1}
                  </span>
                  <GameTile game={g} size="s" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="truncate font-display text-display-m font-semibold text-ink">
                        {p.name}
                      </span>
                      <span className="truncate text-body-s text-ink-muted">
                        {p.team} · {p.role}
                      </span>
                    </div>
                    <div className="mt-2">
                      <StatBar pct={(p.rating / maxRating) * 100} color={t.bg} delay={i * 70 + 200} />
                    </div>
                  </div>
                  {/* Stat labels come from the title, not from Valorant. */}
                  <div className="hidden text-right sm:block">
                    {p.stats.map((stat) => (
                      <div key={stat.label} className="font-mono text-mono-m text-ink-muted">
                        {stat.value} {stat.label}
                      </div>
                    ))}
                  </div>
                  <div className="w-16 text-right">
                    <div className="font-mono text-mono-l text-ink">{p.rating}</div>
                    <div
                      className={`font-mono text-mono-m ${
                        p.delta >= 0 ? 'text-signal' : 'text-ember'
                      }`}
                    >
                      {p.delta >= 0 ? '+' : ''}
                      {p.delta}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </HudPanel>
        </section>

        <section>
          <SectionHeading eyebrow="Standings" title={isAll ? 'Teams on a run' : 'Top teams'} />
          <HudPanel className="divide-y divide-line p-2">
            {data.teams.map((team, i) => {
              const t = tierOf(team.tier)
              return (
                <Reveal key={team.id} delay={i * 70} className="flex items-center gap-4 px-3 py-3">
                  <span className="w-6 font-display text-display-m font-bold text-ink-muted">
                    {i + 1}
                  </span>
                  <GameTile game={gameOf(team)} size="s" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-display-m font-semibold text-ink">
                      {team.name}
                    </div>
                    <div className="text-body-s">
                      <span className={t.text}>{t.label}</span>
                      <span className="text-ink-muted"> · {team.region}</span>
                    </div>
                  </div>

                  <div className="hidden items-center gap-1 sm:flex">
                    {team.form.map((result, k) => (
                      <span
                        key={k}
                        title={result === 'w' ? 'Win' : 'Loss'}
                        className={`flex h-5 w-5 items-center justify-center rounded-[2px] font-mono text-body-s ${
                          result === 'w' ? 'bg-signal/20 text-signal' : 'bg-ember/15 text-ember'
                        }`}
                      >
                        {result.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <div className="w-20 text-right">
                    <div className="font-mono text-mono-m text-ink">{team.record}</div>
                    <div className="text-body-s text-ink-muted">
                      {team.streak > 0 ? `${team.streak} win streak` : 'No streak'}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </HudPanel>
        </section>
      </div>

      {/* News + scene spotlight -------------------------------------------- */}
      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <section>
          <SectionHeading eyebrow="Wire" title="Top news" />
          <div className="grid gap-4">
            {data.news.map((item, i) => (
              <Reveal key={item.id} delay={i * 70}>
                <HudPanel as="article" interactive corners={i === 0} className={i === 0 ? 'p-6' : 'p-4'}>
                  <div className="flex flex-wrap items-center gap-3">
                    <GameStamp game={gameOf(item)} />
                    <span className="hud-label text-signal">{item.tag}</span>
                    <span className="text-body-s text-ink-muted">{item.time}</span>
                  </div>
                  <h3
                    className={`mt-2 font-display font-semibold leading-tight text-ink ${
                      i === 0 ? 'text-display-l' : 'text-display-m'
                    }`}
                  >
                    {item.headline}
                  </h3>
                </HudPanel>
              </Reveal>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Scenes" title="Busiest right now" />
          <div className="grid gap-3">
            {[...GAMES]
              .sort((a, b) => activityFor(b.id).live - activityFor(a.id).live)
              .slice(0, 5)
              .map((g, i) => {
                const activity = activityFor(g.id)
                const genre = genreOf(g)
                return (
                  <Reveal key={g.id} delay={i * 80}>
                    <HudPanel
                      as="button"
                      interactive
                      corners={false}
                      onClick={() => setGameId(g.id)}
                      className="flex w-full items-center gap-4 p-4 text-left"
                    >
                      <GameTile game={g} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-display-m font-semibold text-ink">
                          {g.name}
                        </div>
                        <div className={`truncate text-body-s ${genre.text}`}>
                          {g.platform} · {g.regions.slice(0, 3).join(' · ')}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-mono-l text-ember">{activity.live}</div>
                        <div className="text-body-s text-ink-muted">live</div>
                      </div>
                    </HudPanel>
                  </Reveal>
                )
              })}
          </div>
        </section>
      </div>
    </div>
  )
}
