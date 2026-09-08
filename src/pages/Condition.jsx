import { useNavigate } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Sparkline from '../components/Sparkline'
import {
  AnimatedNumber,
  Gauge,
  HudLabel,
  HudPageHeader,
  HudPanel,
  HudSection,
  StatBar,
} from '../components/hud'
import { Button } from '../components/ui'
import { Dna } from '../components/icons'
import { dimensionOf } from '../data/dna'
import { readiness, wellness } from '../data/mock'

/**
 * Condition - the one screen where readiness still lives, and deliberately the
 * quietest screen in Analyze.
 *
 * Readiness was the headline number of the previous product. Here it is an
 * input: something that explains why consistency read low in a given week, not
 * something that describes a competitor. Each signal therefore names the
 * Competitive DNA dimension it is being used to explain, and the page says so
 * out loud rather than leaving the demotion implicit.
 */

// Sleep clusters between 6 and 8 hours, so a 0-based axis flattens the whole
// week into identical bars. The axis starts at 5h instead - and the legend
// says so, because a truncated axis that isn't labelled overstates the
// differences it reveals.
const SLEEP_FLOOR = 5
const SLEEP_CEILING = 9
const MAX_LOAD = 6
const CHART_H = 140

export default function Condition() {
  const navigate = useNavigate()
  const best = wellness.week.reduce((a, b) => (b.score > a.score ? b : a))
  const worst = wellness.week.reduce((a, b) => (b.score < a.score ? b : a))
  const avgSleep = wellness.week.reduce((s, d) => s + d.sleep, 0) / wellness.week.length
  const tone = readiness.score >= 75 ? 'signal' : 'ember'

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Secondary signal"
        title="Condition"
        subtitle="Sleep, practice load and match stress. Used to explain variance in the profile, not to score you."
        action={
          <Button variant="ghost" onClick={() => navigate('/analyze')}>
            <Dna />
            Competitive DNA
          </Button>
        }
      />

      <HudPanel className="p-5">
        <p className="text-body-m text-ink-muted">
          Readiness is not a headline number in Outplay. A tired week shows up as movement in{' '}
          <span className="text-ink">consistency</span> and{' '}
          <span className="text-ink">pressure performance</span>, and this screen exists to say
          which of those a dip is attributable to — it does not rank you.
        </p>
      </HudPanel>

      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <Reveal>
          <HudPanel className="flex h-full flex-col items-center justify-center p-6">
            <Gauge value={readiness.score} tone={tone}>
              <span className="font-display text-display-xl font-bold text-ink">
                <AnimatedNumber value={readiness.score} />
              </span>
              <span className="hud-label text-ink-muted">Condition</span>
            </Gauge>
            <p className="mt-4 text-center text-body-l text-ink">{readiness.reason}</p>
            <div className="mt-3 flex items-center gap-3">
              <Sparkline points={readiness.trend} />
              <span className="text-body-s text-signal">Trending up</span>
            </div>
          </HudPanel>
        </Reveal>

        <Reveal delay={90}>
          <HudPanel className="h-full p-6">
            <HudSection eyebrow="Seven days" title="Sleep and load" />

            {/* Two series in one column chart: sleep as the bar, load as the
                overlay, score called out above. */}
            <div className="mt-6 flex items-end gap-3">
              {wellness.week.map((day, i) => (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                  <span
                    className={`font-mono text-mono-m ${
                      day.score >= 78 ? 'text-signal' : 'text-ink-muted'
                    }`}
                  >
                    {day.score}
                  </span>
                  <div className="relative flex w-full justify-center" style={{ height: CHART_H }}>
                    <div
                      className="animate-bar-y absolute bottom-0 w-full rounded-sm bg-signal/50"
                      style={{
                        height: `${Math.max(
                          8,
                          ((day.sleep - SLEEP_FLOOR) / (SLEEP_CEILING - SLEEP_FLOOR)) * CHART_H,
                        )}px`,
                        animationDelay: `${150 + i * 70}ms`,
                      }}
                      title={`${day.day}: ${day.sleep}h sleep`}
                    />
                    <div
                      className="animate-bar-y absolute bottom-0 w-2 rounded-sm bg-ember/80"
                      style={{
                        height: `${(day.load / MAX_LOAD) * CHART_H}px`,
                        animationDelay: `${300 + i * 70}ms`,
                      }}
                      title={`${day.day}: load ${day.load}`}
                    />
                  </div>
                  <span className="text-body-s text-ink-muted">{day.day}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-6 border-t border-line pt-4 text-body-s">
              <span className="flex items-center gap-2 text-ink-muted">
                <span aria-hidden="true" className="h-2 w-4 rounded-sm bg-signal/50" />
                Hours slept (axis from {SLEEP_FLOOR}h)
              </span>
              <span className="flex items-center gap-2 text-ink-muted">
                <span aria-hidden="true" className="h-2 w-2 rounded-sm bg-ember/80" />
                Practice load
              </span>
              <span className="text-ink-muted">Number above each day is that day's readiness.</span>
            </div>
          </HudPanel>
        </Reveal>
      </div>

      {/* Inputs -------------------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Inputs"
          title="What each signal explains"
          action={
            <span className="text-body-s text-ink-muted">
              Mapped to the dimension it is used to account for
            </span>
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {readiness.factors.map((factor, i) => (
            <Reveal key={factor.label} delay={i * 80}>
              <HudPanel interactive className="p-5">
                <HudLabel>{factor.label}</HudLabel>
                <div
                  className={`mt-2 font-display text-display-l font-bold ${
                    factor.state === 'warn' ? 'text-ember' : 'text-ink'
                  }`}
                >
                  {factor.value}
                </div>
                <div className="mt-3">
                  <StatBar
                    pct={factor.state === 'warn' ? 88 : 62}
                    color={factor.state === 'warn' ? 'bg-ember' : 'bg-signal'}
                    delay={200 + i * 90}
                  />
                </div>
                <p className="mt-3 text-body-s text-ink-muted">
                  {factor.state === 'warn'
                    ? 'Above your sustainable range this week.'
                    : 'Within your usual range.'}
                </p>
                <p className="mt-3 border-t border-line pt-3 text-body-s text-ink-muted">
                  Read against{' '}
                  <span className="text-signal">
                    {dimensionOf('player', factor.explains)?.label ?? factor.label}
                  </span>
                </p>
              </HudPanel>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Week summary -------------------------------------------------------- */}
      <section>
        <HudSection eyebrow="Summary" title="This week" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Average sleep', value: `${avgSleep.toFixed(1)}h` },
            { label: 'Best day', value: `${best.day} · ${best.score}` },
            { label: 'Toughest day', value: `${worst.day} · ${worst.score}` },
            { label: 'Matches analysed', value: '11' },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70}>
              <HudPanel className="p-4">
                <HudLabel>{stat.label}</HudLabel>
                <div className="mt-2 font-mono text-mono-l text-ink">{stat.value}</div>
              </HudPanel>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
