import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AngularPanel from '../components/AngularPanel'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import DnaRadar, { RadarLegend } from '../components/DnaRadar'
import MatchupBars from '../components/MatchupBars'
import HeadToHead from '../components/HeadToHead'
import InsightCard, { InsightBullet } from '../components/InsightCard'
import CoverageNote from '../components/CoverageNote'
import {
  AnimatedNumber,
  Countdown,
  FormRow,
  HudLabel,
  HudPageHeader,
  HudPanel,
  HudSection,
} from '../components/hud'
import { Button } from '../components/ui'
import { ArrowRight, Clock, Radar, Shield, Target } from '../components/icons'
import { useGame } from '../gameContext'
import { GAMES_BY_ID } from '../data/games'
import { TEAM_DIMENSIONS } from '../data/dna'
import { headToHeadFor, upcomingFor } from '../data/matchup'
import { player } from '../data/mock'

/**
 * The screen the product exists for.
 *
 * It answers "how does your style interact with theirs" and refuses to answer
 * "who is better", which is why the projection sits low on the page in small
 * type with its uncertainty band attached, while the dimension-by-dimension
 * read gets the space. A matchup screen whose largest element was a win
 * percentage would have quietly become a betting site.
 *
 * The reading order is the order a coach would use it in: the paragraph, then
 * the one concern and the one edge, then the shapes, then every dimension,
 * then what to actually do this week.
 */
export default function Matchup() {
  const navigate = useNavigate()
  const { game } = useGame()
  const active = game ?? GAMES_BY_ID[player.primaryGameId]

  const fixtures = upcomingFor(active.id)
  const [fixtureId, setFixtureId] = useState(fixtures[0].id)
  const fixture = fixtures.find((f) => f.id === fixtureId) ?? fixtures[0]
  const m = fixture.matchup
  const h2h = headToHeadFor(active.id, fixture.opponent.id)

  const series = [
    { key: 'you', label: `${m.mine.name} — you`, values: m.mine.values, tone: 'signal' },
    { key: 'them', label: fixture.opponent.name, values: m.theirs.values, tone: 'ember' },
  ]

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Matchup intelligence"
        title={`vs. ${fixture.opponent.name}`}
        subtitle={`${m.mine.name} · ${fixture.kind} · ${fixture.format} · ${fixture.venue}`}
        action={
          <span className="flex items-center gap-2 rounded-base border border-surface bg-surface px-3 py-2 text-body-m text-ink-muted">
            <GameTile game={active} size="s" />
            {active.name}
          </span>
        }
      />

      <CoverageNote game={active} />

      {/* Which fixture ------------------------------------------------------ */}
      <div className="flex flex-wrap gap-2">
        {fixtures.map((option) => {
          const selected = option.id === fixture.id
          const days = Math.round(option.startsInSeconds / 86400)
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setFixtureId(option.id)}
              aria-current={selected ? 'true' : undefined}
              className={`min-w-40 rounded-base border px-3 py-2 text-left transition-colors duration-150 btn-press ${
                selected
                  ? 'border-signal bg-raised text-ink'
                  : 'border-surface bg-surface text-ink-muted hover:text-ink'
              }`}
            >
              <span className="block truncate text-body-m">{option.opponent.name}</span>
              <span className="block truncate text-body-s text-ink-muted">
                {days < 1 ? 'Today' : `In ${days} ${days === 1 ? 'day' : 'days'}`} ·{' '}
                {option.kind}
              </span>
            </button>
          )
        })}
      </div>

      {/* The insight -------------------------------------------------------- */}
      <Reveal key={fixture.id}>
        <AngularPanel
          accent="signal"
          fill="bg-surface"
          innerClassName="scanlines relative overflow-hidden p-6 md:p-8"
        >
          <HudLabel className="text-signal">Matchup insight</HudLabel>

          <div className="mt-4 max-w-3xl space-y-3">
            {m.headline.map((line) => (
              <p key={line} className="font-display text-display-m font-semibold leading-snug text-ink">
                {line}
              </p>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-base border border-surface bg-raised p-5">
              <HudLabel className="text-ink-muted">Primary concern</HudLabel>
              <div className="mt-2 font-display text-display-m font-semibold text-ink">
                {m.primaryConcern ? m.primaryConcern.label : 'Nothing decisive'}
              </div>
              <p className="mt-2 text-body-m text-ink-muted">
                {m.primaryConcern
                  ? `They read ${m.primaryConcern.them} here against your ${m.primaryConcern.you}. ${m.theirStrengths[0].text}.`
                  : 'No dimension where they hold a meaningful advantage.'}
              </p>
            </div>

            <div className="rounded-base border border-edge bg-edge p-5">
              <HudLabel className="text-ink">Potential edge</HudLabel>
              <div className="mt-2 font-display text-display-m font-semibold text-ink">
                {m.primaryEdge ? m.primaryEdge.label : 'Nothing decisive'}
              </div>
              <p className="mt-2 text-body-m text-ink-muted">
                {m.primaryEdge
                  ? `You read ${m.primaryEdge.you} against their ${m.primaryEdge.them}. ${m.theirExploitable[0].text}.`
                  : 'No dimension where you hold a meaningful advantage.'}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-surface pt-5">
            <div>
              <HudLabel className="mb-2">Starts in</HudLabel>
              <Countdown key={fixture.id} seconds={fixture.startsInSeconds} />
            </div>
            <div>
              <HudLabel>Expected tempo</HudLabel>
              <div className="mt-1 font-mono text-mono-l text-ink">{m.expectedTempo.label}</div>
              <p className="mt-1 max-w-xs text-body-s text-ink-muted">{m.expectedTempo.note}</p>
            </div>
            <div>
              <HudLabel>Their recent form</HudLabel>
              <FormRow form={fixture.opponent.form} className="mt-2" />
            </div>
          </div>
        </AngularPanel>
      </Reveal>

      {/* Two shapes on one grid --------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Style against style"
          title="Where the two profiles differ"
          action={
            <Button
              variant="ghost"
              onClick={() => navigate(`/matchup/opponents/${fixture.opponent.id}`)}
            >
              <Radar />
              Opponent profile
            </Button>
          }
        />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,26rem)_1fr]">
          <Reveal>
            <HudPanel className="flex h-full flex-col items-center justify-center p-6">
              <DnaRadar dimensions={TEAM_DIMENSIONS} series={series} size={400} labels="full" />
              <RadarLegend series={series} className="mt-6 justify-center" />
            </HudPanel>
          </Reveal>

          <Reveal delay={90}>
            <HudPanel className="h-full p-6">
              <MatchupBars
                dimensions={m.dimensions}
                youLabel={m.mine.name}
                themLabel={fixture.opponent.name}
              />
              <p className="mt-5 border-t border-surface pt-4 text-body-s text-ink-muted">
                A gap under six points is inside the model's own noise and is shown as even —
                putting a recommendation on top of a rounding error is how analytics products
                lose a coach's trust.
              </p>
            </HudPanel>
          </Reveal>
        </div>
      </section>

      {/* Their tendencies ---------------------------------------------------- */}
      <section>
        <HudSection eyebrow="Scouting read" title={`How ${fixture.opponent.name} plays`} />
        <div className="grid gap-4 lg:grid-cols-3">
          <Reveal>
            <HudPanel className="h-full p-5">
              <HudLabel className="text-ink-muted">Strongest tendencies</HudLabel>
              <ul className="mt-3 space-y-3">
                {m.theirStrengths.map((item) => (
                  <InsightBullet key={item.key} tone="ember">
                    {item.text}{' '}
                    <span className="font-mono text-body-s text-ink">({item.value})</span>
                  </InsightBullet>
                ))}
              </ul>
            </HudPanel>
          </Reveal>

          <Reveal delay={80}>
            <HudPanel className="h-full p-5">
              <HudLabel className="text-edge">Exploitable tendencies</HudLabel>
              <ul className="mt-3 space-y-3">
                {m.theirExploitable.map((item) => (
                  <InsightBullet key={item.key} tone="edge">
                    {item.text}{' '}
                    <span className="font-mono text-body-s text-ink">({item.value})</span>
                  </InsightBullet>
                ))}
              </ul>
            </HudPanel>
          </Reveal>

          <Reveal delay={160}>
            <HudPanel className="h-full p-5">
              <HudLabel>Likely win condition</HudLabel>
              <p className="mt-3 text-body-m text-ink">
                {fixture.opponent.name} wins by {m.theirWinCondition}.
              </p>
              <div className="mt-4 border-t border-surface pt-3">
                <HudLabel className="text-ink-muted">Role reliance</HudLabel>
                <p className="mt-1.5 text-body-m text-ink-muted">
                  <span className="text-ink">{m.roleReliance.level}.</span>{' '}
                  {m.roleReliance.note}
                </p>
              </div>
            </HudPanel>
          </Reveal>
        </div>
      </section>

      {/* History between these two ---------------------------------------- */}
      {h2h && (
        <section>
          <HudSection
            eyebrow="History"
            title={`When you have played ${fixture.opponent.name}`}
          />
          <Reveal>
            <HeadToHead h2h={h2h} />
          </Reveal>
        </section>
      )}

      {/* What to do about it -------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Adapt"
          title="What to prepare"
          action={
            <Button variant="ghost" onClick={() => navigate('/compete/scrims')}>
              Book a scrim block
              <ArrowRight />
            </Button>
          }
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {m.prepFocus.length > 0 ? (
            m.prepFocus.map((focus, i) => (
              <Reveal key={focus.key} delay={i * 80}>
                <HudPanel interactive corners={false} className="h-full p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <HudLabel className="text-ink-muted">{focus.title}</HudLabel>
                    <span className="font-mono text-mono-m text-ember">−{focus.gap}</span>
                  </div>
                  <p className="mt-3 text-body-m text-ink">{focus.action}</p>
                </HudPanel>
              </Reveal>
            ))
          ) : (
            <Reveal>
              <HudPanel className="p-5">
                <p className="text-body-m text-ink-muted">
                  No dimension where the opponent holds a meaningful advantage. Prepare the
                  edges instead of defending.
                </p>
              </HudPanel>
            </Reveal>
          )}
        </div>
      </section>

      {/* The projection, kept in proportion ----------------------------------- */}
      <Reveal>
        <HudPanel className="p-6">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
            <div>
              <HudLabel>Projected outcome</HudLabel>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-display-xl font-bold text-ink">
                  <AnimatedNumber value={m.projection.winPct} suffix="%" />
                </span>
                <span className="font-mono text-mono-m text-ink-muted">
                  ± {m.projection.band}
                </span>
              </div>
              <p className="mt-1 text-body-s text-ink-muted">
                Chance {m.mine.name} takes the series.
              </p>
            </div>

            <div className="min-w-56 flex-1">
              {/* The band is drawn, not just quoted: a range the reader can see
                  is much harder to mistake for a certainty. */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-raised">
                <div
                  className="absolute inset-y-0 rounded-full bg-signal"
                  style={{
                    left: `${Math.max(0, m.projection.winPct - m.projection.band)}%`,
                    width: `${Math.min(100, m.projection.band * 2)}%`,
                  }}
                />
                <div
                  className="absolute inset-y-0 w-0.5 bg-signal"
                  style={{ left: `${m.projection.winPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-body-s text-ink-muted">
                <span>Their series</span>
                <span className="flex items-center gap-1.5">
                  <Shield />
                  Model confidence {m.projection.confidence}%
                </span>
                <span>Your series</span>
              </div>
            </div>

            <Button variant="primary" onClick={() => navigate('/compete/matches')}>
              <Target />
              Open match centre
            </Button>
          </div>
        </HudPanel>
      </Reveal>

      <InsightCard
        tone="muted"
        eyebrow="After the match"
        title="This prediction gets checked."
        body="Once the series is played, match analysis compares every expectation on this page against what the opponent actually did, and the gap updates both profiles."
        source="Continuous learning loop"
        action="See how the last one went"
        onAction={() => navigate('/analyze/matches')}
      />

      <p className="flex items-center gap-2 text-body-s text-ink-muted">
        <Clock />
        Rebuilt whenever either side plays. Last update ran after {fixture.opponent.name}'s most
        recent fixture.
      </p>
    </div>
  )
}
