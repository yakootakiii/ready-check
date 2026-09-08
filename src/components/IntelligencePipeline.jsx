import { useNavigate } from 'react-router-dom'
import Reveal from './Reveal'
import { AnimatedNumber, HudLabel, HudPanel } from './hud'
import { ArrowRight, Cpu, Dna, Layers, Sparkle, Target } from './icons'
import { PIPELINE, pipelineStatsFor } from '../data/intel'

/**
 * What Outplay is actually made of, drawn as a stack.
 *
 * This exists to make one argument visible: the intelligence comes from
 * modelling behaviour, and the language layer only explains what the model
 * already found. So the diagram is weighted deliberately - inputs are quiet,
 * the engine is the heavy middle, and the three things a user touches sit at
 * the bottom as the output of everything above them. A version of this diagram
 * with a chat box at the top would be describing a different product.
 *
 * The stages are read top to bottom on every width. A horizontal flow would
 * collapse into a scroll on a phone, and the ordering is the content.
 */

const KIND = {
  input: {
    icon: Layers,
    accent: 'text-ink-muted',
    rule: 'bg-line',
    panel: 'bg-surface/60',
  },
  engine: {
    icon: Cpu,
    accent: 'text-signal',
    rule: 'bg-signal',
    panel: 'bg-raised/80',
  },
  output: {
    icon: Target,
    accent: 'text-edge',
    rule: 'bg-edge',
    panel: 'bg-surface/85',
  },
}

const STAGE_ICON = { dna: Dna, matchup: Target, insights: Sparkle }

export default function IntelligencePipeline({ gameId = 'all', className = '' }) {
  const navigate = useNavigate()
  const stats = pipelineStatsFor(gameId)

  const figures = [
    { id: 'matches', label: 'Matches ingested', value: stats.matches / 1000, suffix: 'k', decimals: 0 },
    { id: 'features', label: 'Features per match', value: stats.features },
    { id: 'profiles', label: 'Profiles modelled', value: stats.profiles / 1000, suffix: 'k', decimals: 1 },
    { id: 'dimensions', label: 'DNA dimensions', value: stats.dimensions },
  ]

  return (
    <div className={className}>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {figures.map((figure, i) => (
          <Reveal key={figure.id} delay={i * 60}>
            <HudPanel corners={false} className="p-4">
              <HudLabel>{figure.label}</HudLabel>
              <div className="mt-1.5 font-mono text-mono-l text-ink">
                <AnimatedNumber
                  value={figure.value}
                  decimals={figure.decimals ?? 0}
                  suffix={figure.suffix ?? ''}
                />
              </div>
            </HudPanel>
          </Reveal>
        ))}
      </div>

      <ol className="relative">
        {PIPELINE.map((stage, i) => {
          const kind = KIND[stage.kind]
          const Icon = STAGE_ICON[stage.key] ?? kind.icon
          const last = i === PIPELINE.length - 1

          return (
            <li key={stage.key} className="relative pl-8">
              {/* The spine and its travelling pulse: the flow is the claim, so
                  it is drawn rather than described. */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-[11px] top-8 w-px ${kind.rule} opacity-30`}
                />
              )}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-base ${kind.accent}`}
                style={{
                  animation: `stage-pulse 5s ease-in-out ${i * 0.55}s infinite`,
                }}
              >
                <Icon />
              </span>

              <Reveal delay={i * 70} className={last ? '' : 'pb-3'}>
                <HudPanel
                  as={stage.to ? 'button' : 'div'}
                  interactive={Boolean(stage.to)}
                  corners={false}
                  onClick={stage.to ? () => navigate(stage.to) : undefined}
                  className={`w-full p-4 text-left ${kind.panel}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-display text-display-m font-semibold text-ink">
                      {stage.label}
                    </span>
                    {stage.to ? (
                      <span className="flex items-center gap-1.5 text-body-s text-signal">
                        Open
                        <ArrowRight />
                      </span>
                    ) : (
                      <HudLabel className={kind.accent}>
                        {stage.kind === 'engine' ? 'Engine' : 'Input'}
                      </HudLabel>
                    )}
                  </div>
                  <p className="mt-1 text-body-m text-ink-muted">{stage.note}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {stage.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-line px-2.5 py-0.5 font-mono text-body-s text-ink-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </HudPanel>
              </Reveal>
            </li>
          )
        })}
      </ol>

      <p className="mt-4 flex items-start gap-2 text-body-s text-ink-muted">
        <Sparkle className="mt-0.5 shrink-0 text-ink-muted" />
        Language models sit at the end of this stack as an explanation layer.
        They put the model's findings into a sentence; they are not where the
        findings come from.
      </p>
    </div>
  )
}
