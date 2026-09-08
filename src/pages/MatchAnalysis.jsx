import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import InsightCard, { InsightBullet } from '../components/InsightCard'
import CoverageNote from '../components/CoverageNote'
import { DeltaChip } from '../components/DnaDimensions'
import {
  AnimatedNumber,
  HudLabel,
  HudPageHeader,
  HudPanel,
  HudSection,
  StatBar,
} from '../components/hud'
import { Button } from '../components/ui'
import { ArrowRight, Cpu, Sparkle, Target } from '../components/icons'
import { useGame } from '../gameContext'
import { GAMES_BY_ID } from '../data/games'
import { modelAccuracyFor, recentMatchesFor } from '../data/matchup'
import { player } from '../data/mock'

/**
 * Post-match intelligence: what the model expected, against what actually
 * happened, and what it learned from the difference.
 *
 * This is the half of the loop that makes the other half worth having. A
 * platform that only predicted would be a novelty; one that only reported
 * would be a scoreboard. So the page is built as a comparison, and the
 * verdicts are graded honestly - `confirmed` teaches nothing, `surprise` is
 * where the model was wrong and therefore where it improves.
 *
 * Model accuracy is stated at the top rather than buried. A prediction without
 * a track record beside it is a guess with a percentage on it.
 */

const VERDICTS = {
  confirmed: { label: 'Confirmed', tone: 'muted', text: 'text-ink-muted', bar: 'bg-ink-muted' },
  shifted: { label: 'Shifted', tone: 'signal', text: 'text-signal', bar: 'bg-signal' },
  surprise: { label: 'Surprise', tone: 'ember', text: 'text-ember', bar: 'bg-ember' },
}

export default function MatchAnalysis() {
  const navigate = useNavigate()
  const { game } = useGame()
  const active = game ?? GAMES_BY_ID[player.primaryGameId]

  const matches = recentMatchesFor(active.id)
  const accuracy = modelAccuracyFor(active.id)
  const [matchId, setMatchId] = useState(matches[0].id)
  const match = matches.find((m) => m.id === matchId) ?? matches[0]
  const debrief = match.debrief

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Post-match intelligence"
        title="Match analysis"
        subtitle="What the model expected, what the opponent actually did, and what changed because of it."
        action={
          <span className="flex items-center gap-2 rounded-base border border-line bg-surface/85 px-3 py-2 text-body-m text-ink-muted">
            <GameTile game={active} size="s" />
            {active.name}
          </span>
        }
      />

      <CoverageNote game={active} />

      {/* How well the model has been doing ---------------------------------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { id: 'called', label: 'Results called', value: accuracy.pct, suffix: '%', note: `${accuracy.called} of ${accuracy.matches}` },
          { id: 'behaviour', label: 'Behavioural accuracy', value: accuracy.behavioural, suffix: '%', note: 'Per-tendency, weighted' },
          { id: 'discoveries', label: 'Tendencies learned', value: accuracy.discoveries, note: 'From the last five' },
          { id: 'matches', label: 'Matches analysed', value: accuracy.matches, note: 'In this window' },
        ].map((stat, i) => (
          <Reveal key={stat.id} delay={i * 60}>
            <HudPanel interactive className="p-4">
              <HudLabel>{stat.label}</HudLabel>
              <div className="mt-2 font-display text-display-l font-bold text-ink">
                <AnimatedNumber value={stat.value} suffix={stat.suffix ?? ''} />
              </div>
              <p className="mt-1 text-body-s text-ink-muted">{stat.note}</p>
            </HudPanel>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[20rem_1fr]">
        {/* Which match ------------------------------------------------------ */}
        <section>
          <HudSection eyebrow="Recent" title="Matches" />
          <HudPanel className="divide-y divide-line p-2">
            {matches.map((row) => {
              const selected = row.id === match.id
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setMatchId(row.id)}
                  aria-current={selected ? 'true' : undefined}
                  className={`flex w-full items-center gap-3 rounded-base px-3 py-3 text-left transition-colors duration-100 ${
                    selected ? 'bg-raised' : 'hover:bg-raised/60'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-8 w-0.5 shrink-0 ${row.won ? 'bg-edge' : 'bg-ember'}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-m text-ink">
                      {row.opponent.name}
                    </span>
                    <span className="block truncate text-body-s text-ink-muted">
                      {row.played} · {row.kind}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span
                      className={`block font-mono text-mono-m ${row.won ? 'text-edge' : 'text-ember'}`}
                    >
                      {row.score.join('–')}
                    </span>
                    <span className="block text-body-s text-ink-muted">
                      {row.debrief.accuracy}% called
                    </span>
                  </span>
                </button>
              )
            })}
          </HudPanel>
        </section>

        {/* Prediction against reality --------------------------------------- */}
        <section key={match.id}>
          <HudSection
            eyebrow={`${match.won ? 'Won' : 'Lost'} ${match.score.join('–')} · ${match.played}`}
            title={`vs. ${match.opponent.name}`}
            action={
              <Button
                variant="ghost"
                onClick={() => navigate(`/matchup/opponents/${match.opponent.id}`)}
              >
                <Target />
                Opponent profile
              </Button>
            }
          />

          <div className="space-y-3">
            {debrief.observations.map((observation, i) => {
              const verdict = VERDICTS[observation.verdict]
              return (
                <Reveal key={observation.id} delay={i * 70}>
                  <HudPanel corners={false} className="p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="font-display text-display-m font-semibold text-ink">
                        {observation.label}
                      </span>
                      <span className={`hud-label ${verdict.text}`}>{verdict.label}</span>
                    </div>

                    {/* Predicted and actual on one scale, so the gap is the
                        thing you see rather than two numbers to subtract. */}
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <HudLabel>Predicted</HudLabel>
                          <span className="font-mono text-mono-m text-ink-muted">
                            {observation.predicted}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <StatBar pct={observation.predicted} color="bg-ink-muted" delay={120} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <HudLabel className={verdict.text}>Actual</HudLabel>
                          <span className={`font-mono text-mono-m ${verdict.text}`}>
                            {observation.actual}
                            <span className="ml-2 text-body-s">
                              {observation.gap > 0 ? '+' : observation.gap < 0 ? '−' : '±'}
                              {Math.abs(observation.gap)}
                            </span>
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <StatBar pct={observation.actual} color={verdict.bar} delay={240} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 border-t border-line pt-3">
                      <p className="text-body-m text-ink-muted">{observation.expectation}</p>
                      <p className="text-body-m text-ink">{observation.reality}</p>
                    </div>
                  </HudPanel>
                </Reveal>
              )
            })}
          </div>

          {/* What the system learned ----------------------------------------- */}
          <Reveal className="mt-4">
            <InsightCard
              size="l"
              tone="signal"
              eyebrow="New insight"
              title={debrief.discovery.text}
              body={debrief.discovery.effect}
              source={`Learned from ${match.opponent.name}, ${match.played}`}
              action="See their updated profile"
              onAction={() => navigate(`/matchup/opponents/${match.opponent.id}`)}
            />
          </Reveal>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Reveal>
              <HudPanel className="h-full p-5">
                <HudLabel className="text-edge">Successful adaptations</HudLabel>
                <ul className="mt-3 space-y-2">
                  {debrief.adaptations.map((item) => (
                    <InsightBullet key={item} tone="edge">
                      {item}
                    </InsightBullet>
                  ))}
                </ul>
              </HudPanel>
            </Reveal>

            <Reveal delay={80}>
              <HudPanel className="h-full p-5">
                <HudLabel className="text-ember">Mistakes</HudLabel>
                <ul className="mt-3 space-y-2">
                  {debrief.mistakes.map((item) => (
                    <InsightBullet key={item} tone="ember">
                      {item}
                    </InsightBullet>
                  ))}
                </ul>
              </HudPanel>
            </Reveal>

            <Reveal delay={160}>
              <HudPanel className="h-full p-5">
                <HudLabel className="text-signal">Your profile moved</HudLabel>
                <ul className="mt-3 space-y-2.5">
                  {debrief.modelUpdate.map((update) => (
                    <li key={update.key} className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 flex-1 truncate text-body-m text-ink-muted">
                        {update.label}
                      </span>
                      <DeltaChip delta={update.delta} />
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-line pt-3 text-body-s text-ink-muted">
                  One match moves a dimension by a point or two. Anything larger would be
                  fitting noise.
                </p>
              </HudPanel>
            </Reveal>
          </div>
        </section>
      </div>

      <Reveal>
        <HudPanel className="flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="flex items-start gap-2 text-body-m text-ink-muted">
            <Cpu className="mt-1 shrink-0" />
            Every debrief on this page feeds the engine that built both profiles. The next
            matchup read is computed after these updates, not before them.
          </p>
          <Button onClick={() => navigate('/matchup')}>
            <Sparkle />
            Next matchup
            <ArrowRight />
          </Button>
        </HudPanel>
      </Reveal>
    </div>
  )
}
