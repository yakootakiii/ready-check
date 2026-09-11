import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AngularPanel from '../components/AngularPanel'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import DnaRadar, { RadarLegend } from '../components/DnaRadar'
import { DnaStrip } from '../components/DnaDimensions'
import InsightCard from '../components/InsightCard'
import IntelligencePipeline from '../components/IntelligencePipeline'
import CoverageNote from '../components/CoverageNote'
import { MatchupMeter } from '../components/MatchupBars'
import Sparkline from '../components/Sparkline'
import {
  AnimatedNumber,
  Countdown,
  FormRow,
  HudLabel,
  HudPanel,
  HudSection,
  LivePip,
  Ticker,
} from '../components/hud'
import { Button } from '../components/ui'
import { ArrowRight, Broadcast, Dna, Radar, Target, Trend } from '../components/icons'
import { useGame } from '../gameContext'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { coreDimensionsFor } from '../data/dna'
import { acrossGames, activityFor, liveMatchesFor } from '../data/generate'
import { modelAccuracyFor, myDna, nextFixture } from '../data/matchup'
import { insightFeedFor } from '../data/intel'
import { player } from '../data/mock'
import { tier as tierOf } from '../tiers'

/**
 * The landing surface, and the product's whole argument in one scroll.
 *
 * Order is the message. The hero states what Outplay is; then the four panels
 * a competitor actually opens the app for - who you are, who is next, where
 * you are ahead, what you have to survive; then what the system has learned
 * lately; then, at the bottom, how it works. Ecosystem content (live matches,
 * the circuit) sits below the intelligence rather than above it, because an
 * aggregator is the thing this product is deliberately not.
 *
 * Intelligence is per-title, so an "all titles" selection resolves to the
 * player's primary game rather than averaging twenty-five scenes into
 * something meaningless.
 */
export default function Home() {
  const navigate = useNavigate()
  const { game, gameId, isAll } = useGame()

  const active = game ?? GAMES_BY_ID[player.primaryGameId]
  const mine = myDna(active.id)
  const fixture = nextFixture(active.id)
  const matchup = fixture.matchup
  const insights = insightFeedFor(active.id)
  const accuracy = modelAccuracyFor(active.id)
  const core = coreDimensionsFor('team')

  const series = [
    { key: 'you', label: `${mine.name} — you`, values: mine.values, tone: 'signal' },
    { key: 'them', label: `${fixture.opponent.name} — next opponent`, values: matchup.theirs.values, tone: 'ember' },
  ]

  const liveNow = useMemo(
    () =>
      isAll
        ? acrossGames(liveMatchesFor, { limit: 3, sortBy: (a, b) => b.viewers - a.viewers })
        : liveMatchesFor(gameId).slice(0, 3),
    [gameId, isAll],
  )

  const ticker = useMemo(
    () =>
      insights.map((row) => ({
        id: row.id,
        eyebrow: row.eyebrow,
        text: row.title,
      })),
    [insights],
  )

  return (
    <div className="space-y-12">
      {/* What the model has worked out, on a loop. The old product tickered
          scores here; scores are the input, and these are the output. */}
      <Ticker className="-mx-4 border-y border-surface bg-surface py-2 md:-mx-6">
        {ticker.map((item) => (
          <span key={item.id} className="flex items-center gap-2 px-6">
            <span className="hud-label text-ember">{item.eyebrow}</span>
            <span className="whitespace-nowrap text-body-m text-ink">{item.text}</span>
          </span>
        ))}
      </Ticker>

      {/* Hero ------------------------------------------------------------- */}
      <Reveal>
        <AngularPanel
          accent="signal"
          fill="bg-surface"
          innerClassName="sheen-run scanlines relative overflow-hidden p-6 md:p-10"
        >
          <div className="flex flex-wrap items-center gap-10">
            <div className="min-w-72 max-w-2xl flex-1">
              <HudLabel className="text-ember">Competitive intelligence for esports</HudLabel>

              <h1 className="mt-3 font-display text-[clamp(3rem,8vw,5.5rem)] font-black uppercase leading-[0.9] tracking-[-0.02em] text-ember">
                Outplay
              </h1>
              <p className="mt-4 font-display text-[clamp(1.25rem,2.6vw,1.75rem)] font-semibold leading-tight text-ink">
                Know your game. Know your opponent.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => navigate('/analyze')}>
                  <Dna />
                  Analyse my game
                </Button>
                <Button onClick={() => navigate('/network')}>
                  Explore competition
                  <ArrowRight />
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-surface pt-5">
                <span className="flex items-center gap-2">
                  <GameTile game={active} size="s" />
                  <span className="text-body-m text-ink-muted">
                    {active.name} · {genreOf(active).label}
                  </span>
                </span>
                <span className="text-body-s text-ink-muted">
                  <span className="font-mono text-mono-m text-ember">{accuracy.pct}%</span>{' '}
                  call accuracy
                </span>
              </div>
            </div>

            {/* The thesis, drawn: your shape and your next opponent's on one
                grid. Everything else on this page is a reading of this. */}
            <div className="mx-auto w-full max-w-sm shrink-0 lg:w-80">
              <DnaRadar dimensions={core} series={series} size={300} labels="short" />
              <RadarLegend series={series} className="mt-4 justify-center" />
            </div>
          </div>
        </AngularPanel>
      </Reveal>

      <CoverageNote game={active} />

      {/* The four panels ---------------------------------------------------- */}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <HudPanel className="h-full p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <HudLabel className="text-edge">Your competitive DNA</HudLabel>
                <div className="mt-1.5 font-display text-display-l font-bold text-ink">
                  {mine.identity}
                </div>
                <p className="mt-1 text-body-m text-ink-muted">
                  {mine.name} · {mine.team.record} · {mine.team.region}
                </p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/analyze')}>
                Full profile
                <ArrowRight />
              </Button>
            </div>

            <DnaStrip dna={mine} className="mt-6" />

            <ul className="mt-6 space-y-2 border-t border-surface pt-4">
              {mine.traits.map((trait) => (
                <li key={trait} className="flex gap-3 text-body-m text-ink-muted">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-edge" />
                  {trait}
                </li>
              ))}
            </ul>
          </HudPanel>
        </Reveal>

        <Reveal delay={90}>
          <AngularPanel
            accent="ember"
            fill="bg-surface"
            className="h-full"
            innerClassName="flex h-full flex-col p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <HudLabel className="text-edge">Next match</HudLabel>
              <span className="text-body-s text-ink-muted">
                {fixture.format} · {fixture.kind}
              </span>
            </div>

            <div className="mt-3 font-display text-display-l font-bold text-ink">
              vs. {fixture.opponent.name}
            </div>
            <p className="mt-1 text-body-m text-ink-muted">
              {matchup.theirs.identity} · {fixture.opponent.region} ·{' '}
              {fixture.opponent.record}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <FormRow form={fixture.opponent.form} />
              <span className="text-body-s text-ink-muted">
                Expected tempo:{' '}
                <span className="font-mono text-mono-m text-ink">
                  {matchup.expectedTempo.label}
                </span>
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {matchup.dimensions
                .filter((d) => d.favour !== 'even')
                .slice(0, 2)
                .map((dim) => (
                  <MatchupMeter key={dim.key} dimension={dim} />
                ))}
            </div>

            <div className="mt-6">
              <HudLabel className="mb-2">Starts in</HudLabel>
              <Countdown seconds={fixture.startsInSeconds} />
            </div>

            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              <Button variant="primary" onClick={() => navigate('/matchup')}>
                <Target />
                Matchup intelligence
              </Button>
              <Button onClick={() => navigate('/matchup/opponents')}>
                <Radar />
                Scout opponents
              </Button>
            </div>
          </AngularPanel>
        </Reveal>
      </div>

      {/* Edge and watch-out -------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <InsightCard
            size="l"
            tone="edge"
            eyebrow="Your edge"
            title={
              matchup.primaryEdge
                ? `${matchup.primaryEdge.label}: ${matchup.primaryEdge.you} against their ${matchup.primaryEdge.them}`
                : 'No decisive edge in this matchup'
            }
            body={
              matchup.primaryEdge
                ? `${matchup.theirExploitable[0].text}. This is the dimension to force the game into.`
                : 'The two profiles are close on every dimension. This one will be decided on execution.'
            }
            source={`Against ${fixture.opponent.name} · ${fixture.kind}`}
            action="See the full read"
            onAction={() => navigate('/matchup')}
          />
        </Reveal>
        <Reveal delay={90}>
          <InsightCard
            size="l"
            tone="ember"
            eyebrow="Watch out"
            title={
              matchup.primaryConcern
                ? `${matchup.primaryConcern.label}: their ${matchup.primaryConcern.them} against your ${matchup.primaryConcern.you}`
                : 'No standout vulnerability'
            }
            body={`${matchup.theirStrengths[0].text}. ${
              matchup.prepFocus[0]?.action ?? ''
            }`}
            source={`Model confidence ${matchup.projection.confidence}%`}
            action="Open prep focus"
            onAction={() => navigate('/matchup')}
          />
        </Reveal>
      </div>

      {/* Recent insights ----------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Continuous learning"
          title="Recent insights"
          action={
            <Button variant="ghost" onClick={() => navigate('/analyze/matches')}>
              Match analysis
              <ArrowRight />
            </Button>
          }
        />
        <div className="grid gap-3 lg:grid-cols-2">
          {insights.map((row, i) => (
            <Reveal key={row.id} delay={i * 70}>
              <InsightCard
                tone={row.tone}
                eyebrow={row.eyebrow}
                title={row.title}
                body={row.body}
                source={row.source}
                action="Open"
                onAction={() => navigate(row.to)}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Performance evolution ------------------------------------------------ */}
      <section>
        <HudSection
          eyebrow="Performance evolution"
          title="How your profile has moved"
          action={
            <Button variant="ghost" onClick={() => navigate('/analyze/trends')}>
              <Trend />
              Full history
            </Button>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {core.map((dim, i) => {
            const points = mine.history.map((frame) => frame.values[dim.key])
            const delta = mine.deltas[dim.key]
            return (
              <Reveal key={dim.key} delay={i * 60}>
                <HudPanel interactive corners={false} className="p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <HudLabel>{dim.label}</HudLabel>
                    <span
                      className={`font-mono text-body-s ${
                        delta > 1 ? 'text-edge' : delta < -1 ? 'text-ember' : 'text-ink-muted'
                      }`}
                    >
                      {delta > 0 ? '+' : delta < 0 ? '−' : '±'}
                      {Math.abs(delta)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="font-display text-display-l font-bold text-ink">
                      <AnimatedNumber value={mine.values[dim.key]} />
                    </span>
                    <Sparkline
                      points={points}
                      stroke={delta < -1 ? 'var(--color-ember)' : 'var(--color-edge)'}
                    />
                  </div>
                  <p className="mt-2 text-body-s text-ink-muted">
                    {mine.history[0].label} → {mine.history[mine.history.length - 1].label}
                  </p>
                </HudPanel>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* The ecosystem, below the intelligence -------------------------------- */}
      <section>
        <HudSection
          eyebrow="Explore competition"
          title="Live right now"
          action={
            <Button variant="ghost" onClick={() => navigate('/compete/matches')}>
              <Broadcast />
              Match centre
            </Button>
          }
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {liveNow.map((match, i) => {
            const g = GAMES_BY_ID[match.gameId]
            const t = tierOf(match.tier)
            return (
              <Reveal key={match.id} delay={i * 70}>
                <HudPanel
                  as="button"
                  interactive
                  glow="ember"
                  onClick={() => navigate(`/compete/tournaments/${match.gameId}`)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-ember">
                      <LivePip />
                      <span className="hud-label truncate text-ember">{match.kind}</span>
                    </span>
                    <GameTile game={g} size="s" />
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
                  <div className="mt-4 flex items-center justify-between border-t border-surface pt-3">
                    <span className={`text-body-s ${t.text}`}>{t.label}</span>
                    <span className="font-mono text-body-s text-ink-muted">
                      {(match.viewers / 1000).toFixed(1)}k watching
                    </span>
                  </div>
                </HudPanel>
              </Reveal>
            )
          })}
        </div>
        <p className="mt-4 text-body-s text-ink-muted">
          {activityFor(active.id).players.toLocaleString()} {active.short} competitors on the
          platform · {activityFor(active.id).scrims} scrims open today
        </p>
      </section>

      {/* How it works --------------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Under the hood"
          title="What the intelligence is built from"
        />
        <IntelligencePipeline gameId={active.id} />
      </section>
    </div>
  )
}
