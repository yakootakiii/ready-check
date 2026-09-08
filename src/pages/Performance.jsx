import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import Sparkline from '../components/Sparkline'
import DnaRadar, { RadarLegend } from '../components/DnaRadar'
import CoverageNote from '../components/CoverageNote'
import InsightCard from '../components/InsightCard'
import { DeltaChip } from '../components/DnaDimensions'
import { AnimatedNumber, HudLabel, HudPageHeader, HudPanel, HudSection } from '../components/hud'
import { Button } from '../components/ui'
import { ArrowRight, Heart, Trend } from '../components/icons'
import { useGame } from '../gameContext'
import { GAMES_BY_ID } from '../data/games'
import { dimensionsFor, playerDna } from '../data/dna'
import { myDna, recentMatchesFor } from '../data/matchup'
import { trajectoryFor } from '../data/talent'
import { player, playerEntityFor, readiness } from '../data/mock'

/**
 * Performance evolution: how a Competitive DNA profile got to its current
 * shape.
 *
 * Twelve series on one set of axes would be spaghetti, and colouring twelve
 * lines would break the rule that colour means something. So the page is small
 * multiples - one chart per dimension, all on the same 0-100 scale so their
 * heights are comparable - with one dimension promoted to a large chart when
 * it is selected. Twelve small charts you can actually read beat one chart
 * that has to be decoded.
 *
 * The axis runs the full 0-100 because the dimensions are defined on that
 * range; this is the one chart in the app that should not be truncated.
 */

const CHART_H = 200

/** One dimension over the tracked window, at full size. */
function EvolutionChart({ frames, dimensionKey, tone = 'var(--color-signal)' }) {
  const values = frames.map((frame) => frame.values[dimensionKey])
  const w = 640
  const h = CHART_H
  const stepX = w / (values.length - 1)
  const yOf = (value) => h - (value / 100) * h

  const path = values
    .map((value, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)} ${yOf(value).toFixed(1)}`)
    .join(' ')
  const area = `${path} L${w} ${h} L0 ${h} Z`

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="overflow-visible"
      >
        {[0, 25, 50, 75, 100].map((line) => (
          <line
            key={line}
            x1="0"
            x2={w}
            y1={yOf(line)}
            y2={yOf(line)}
            stroke="var(--color-line)"
            strokeWidth="1"
            opacity={line === 0 || line === 100 ? 0.8 : 0.4}
          />
        ))}
        <path d={area} fill={tone} opacity="0.1" />
        <path
          d={path}
          fill="none"
          stroke={tone}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1000}
          className="animate-trace"
          style={{ '--trace-length': 1000 }}
        />
        {values.map((value, i) => (
          <circle
            key={frames[i].label}
            cx={i * stepX}
            cy={yOf(value)}
            r="3"
            fill="var(--color-base)"
            stroke={tone}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="animate-fade-in"
            style={{ animationDelay: `${500 + i * 70}ms` }}
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between">
        {frames.map((frame, i) => (
          <span key={frame.label} className="text-center">
            <span className="block font-mono text-mono-m text-ink">
              {frame.values[dimensionKey]}
            </span>
            <span className="block text-body-s text-ink-muted">{frame.label}</span>
            <span className="sr-only">
              {i === frames.length - 1 ? 'current window' : 'earlier window'}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-body-s text-ink-muted">Axis 0–100, the full range of the model.</p>
    </div>
  )
}

const SUBJECTS = [
  { key: 'team', label: 'Team DNA' },
  { key: 'player', label: 'Your player DNA' },
]

export default function Performance() {
  const navigate = useNavigate()
  const { game } = useGame()
  const active = game ?? GAMES_BY_ID[player.primaryGameId]

  const [subject, setSubject] = useState('team')
  const dna = subject === 'team' ? myDna(active.id) : playerDna(playerEntityFor(active.id))
  const dimensions = dimensionsFor(dna.kind)
  const [selectedKey, setSelectedKey] = useState(dimensions[0].key)
  const selected = dimensions.find((d) => d.key === selectedKey) ?? dimensions[0]

  const trajectory = trajectoryFor(dna)
  const matches = recentMatchesFor(active.id)

  const movers = [...dimensions]
    .map((dim) => ({ ...dim, delta: dna.deltas[dim.key], value: dna.values[dim.key] }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4)

  const series = [
    { key: 'now', label: `Now · ${dna.history[dna.history.length - 1].label}`, values: dna.values, tone: 'signal' },
    { key: 'then', label: `${dna.history[0].label}`, values: dna.history[0].values, tone: 'muted', ghost: true },
  ]

  const selectedDelta = dna.deltas[selected.key]

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Performance evolution"
        title="How the profile has moved"
        subtitle="Six tracked windows. Every dimension on the same scale, so the shapes are comparable."
        action={
          <span className="flex items-center gap-2 rounded-base border border-line bg-surface/85 px-3 py-2 text-body-m text-ink-muted">
            <GameTile game={active} size="s" />
            {active.name}
          </span>
        }
      />

      <CoverageNote game={active} />

      <div className="flex flex-wrap items-center gap-2">
        {SUBJECTS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => {
              setSubject(option.key)
              setSelectedKey(dimensionsFor(option.key)[0].key)
            }}
            aria-pressed={subject === option.key}
            className={`rounded-base border px-3 py-2 text-body-m transition-colors duration-150 ${
              subject === option.key
                ? 'border-signal/70 bg-raised text-ink'
                : 'border-line bg-surface/60 text-ink-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        ))}
        <span
          className={`ml-2 flex items-center gap-2 text-body-m ${
            trajectory.tone === 'edge'
              ? 'text-edge'
              : trajectory.tone === 'ember'
                ? 'text-ember'
                : 'text-ink-muted'
          }`}
        >
          <Trend />
          {trajectory.label}
          <span className="font-mono text-body-s text-ink-muted">
            ({trajectory.drift > 0 ? '+' : ''}
            {trajectory.drift} avg)
          </span>
        </span>
      </div>

      {/* The selected dimension --------------------------------------------- */}
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <Reveal>
          <HudPanel className="h-full p-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <HudLabel className="text-signal">{selected.label}</HudLabel>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-display text-display-xl font-bold text-ink">
                    <AnimatedNumber value={dna.values[selected.key]} />
                  </span>
                  <DeltaChip delta={selectedDelta} className="text-body-m" />
                </div>
                <p className="mt-1 max-w-md text-body-m text-ink-muted">{selected.blurb}</p>
              </div>
            </div>
            <EvolutionChart
              key={`${subject}-${selected.key}`}
              frames={dna.history}
              dimensionKey={selected.key}
              tone={selectedDelta < -1 ? 'var(--color-ember)' : 'var(--color-signal)'}
            />
          </HudPanel>
        </Reveal>

        <Reveal delay={90}>
          <HudPanel className="flex h-full flex-col items-center p-6">
            <HudLabel className="self-start">Then and now</HudLabel>
            <DnaRadar
              dimensions={dimensions}
              series={series}
              size={280}
              labels="short"
              className="mt-4"
            />
            <RadarLegend series={series} className="mt-5 justify-center" />
            <p className="mt-4 text-center text-body-s text-ink-muted">
              The whole shape, six months apart. Where the solid line has pulled away from the
              dashed one is where the work landed.
            </p>
          </HudPanel>
        </Reveal>
      </div>

      {/* Small multiples ----------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Every dimension"
          title="Twelve tracks, one scale"
          action={<span className="text-body-s text-ink-muted">Pick one to open it above</span>}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {dimensions.map((dim, i) => {
            const points = dna.history.map((frame) => frame.values[dim.key])
            const delta = dna.deltas[dim.key]
            const isSelected = dim.key === selected.key
            return (
              <Reveal key={dim.key} delay={Math.min(i, 8) * 50}>
                <HudPanel
                  as="button"
                  interactive
                  corners={false}
                  onClick={() => setSelectedKey(dim.key)}
                  aria-pressed={isSelected}
                  className={`w-full p-4 text-left ${isSelected ? 'border-signal/70' : ''}`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <HudLabel className="truncate">{dim.label}</HudLabel>
                    <DeltaChip delta={delta} />
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="font-display text-display-l font-bold text-ink">
                      {dna.values[dim.key]}
                    </span>
                    <Sparkline
                      points={points}
                      stroke={delta < -1 ? 'var(--color-ember)' : 'var(--color-signal)'}
                    />
                  </div>
                </HudPanel>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Why it moved --------------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Attribution"
          title="What moved the profile"
          action={
            <Button variant="ghost" onClick={() => navigate('/analyze/matches')}>
              Match analysis
              <ArrowRight />
            </Button>
          }
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <HudPanel className="h-full p-5">
              <HudLabel>Biggest movers this window</HudLabel>
              <ul className="mt-4 space-y-3">
                {movers.map((mover) => (
                  <li key={mover.key} className="flex items-baseline gap-3">
                    <span className="min-w-0 flex-1 truncate text-body-m text-ink">
                      {mover.label}
                    </span>
                    <span className="font-mono text-mono-m text-ink-muted">{mover.value}</span>
                    <DeltaChip delta={mover.delta} />
                  </li>
                ))}
              </ul>
            </HudPanel>
          </Reveal>

          <Reveal delay={90}>
            <HudPanel className="h-full p-5">
              <HudLabel>Matches in this window</HudLabel>
              <ul className="mt-4 space-y-2.5">
                {matches.map((row) => (
                  <li key={row.id} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`h-5 w-1 shrink-0 rounded-full ${row.won ? 'bg-edge' : 'bg-ember'}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-body-m text-ink-muted">
                      {row.won ? 'Won' : 'Lost'} {row.score.join('–')} vs. {row.opponent.name}
                    </span>
                    <span className="shrink-0 text-body-s text-ink-muted">{row.played}</span>
                  </li>
                ))}
              </ul>
            </HudPanel>
          </Reveal>
        </div>
      </section>

      <Reveal>
        <InsightCard
          tone="muted"
          eyebrow="Secondary signal"
          title={`Condition is being used to explain variance, not to score you.`}
          body={`Sleep, practice load and match stress are read as inputs to consistency and pressure. This week they read ${readiness.reason.toLowerCase()}.`}
          source="Condition · secondary metric"
          action="Open condition"
          onAction={() => navigate('/analyze/condition')}
        />
      </Reveal>

      <p className="flex items-center gap-2 text-body-s text-ink-muted">
        <Heart />
        Readiness is deliberately not a headline number here. It explains a dip; it does not
        describe a competitor.
      </p>
    </div>
  )
}
