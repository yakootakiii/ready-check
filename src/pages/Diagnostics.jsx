import { useMemo, useState } from 'react'
import DiagnosticChecklist from '../components/DiagnosticChecklist'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import { HudLabel, HudPageHeader, HudPanel, HudSection, StatBar } from '../components/hud'
import { Button } from '../components/ui'
import { Check, Warn } from '../components/icons'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { diagnosticsFor, networkMetricsFor } from '../data/checks'
import { player } from '../data/mock'
import { useGame } from '../gameContext'

export default function Diagnostics() {
  const { game } = useGame()
  const active = game ?? GAMES_BY_ID[player.primaryGameId]
  const checks = useMemo(() => diagnosticsFor(active.platform), [active.platform])
  const metrics = networkMetricsFor(active.platform)
  const warnings = checks.filter((d) => d.state !== 'pass')
  const passRate = Math.round(((checks.length - warnings.length) / checks.length) * 100)

  const [ranAt, setRanAt] = useState('4 minutes ago')

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow={`${active.platform} · ${genreOf(active).label}`}
        title="Diagnostics"
        subtitle={`Checks tuned for ${active.name}. Last run ${ranAt}.`}
        action={
          <Button variant="primary" onClick={() => setRanAt('just now')}>
            Run check
          </Button>
        }
      />

      {/* Headline ----------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal>
          <HudPanel className="h-full p-5">
            <HudLabel>Checks passing</HudLabel>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`font-display text-display-xl font-bold ${
                  warnings.length ? 'text-ember' : 'text-signal'
                }`}
              >
                {passRate}%
              </span>
              <span className="text-body-m text-ink-muted">
                {checks.length - warnings.length}/{checks.length}
              </span>
            </div>
            <div className="mt-3">
              <StatBar
                pct={passRate}
                color={warnings.length ? 'bg-ember' : 'bg-signal'}
                delay={200}
              />
            </div>
          </HudPanel>
        </Reveal>

        <Reveal delay={80}>
          <HudPanel className="h-full p-5">
            <HudLabel>Needs attention</HudLabel>
            <ul className="mt-3 space-y-2">
              {warnings.length ? (
                warnings.map((w) => (
                  <li key={w.id} className="flex items-center gap-2 text-body-m text-ember">
                    <Warn className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{w.label}</span>
                    <span className="font-mono text-mono-m">{w.value}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-2 text-body-m text-ink-muted">
                  <Check className="shrink-0 text-signal" />
                  Nothing flagged
                </li>
              )}
            </ul>
          </HudPanel>
        </Reveal>

        <Reveal delay={160}>
          <HudPanel className="h-full p-5">
            <HudLabel>Profile</HudLabel>
            <div className="mt-3 flex items-center gap-3">
              <GameTile game={active} size="l" />
              <div className="min-w-0">
                <div className="truncate font-display text-display-m font-semibold text-ink">
                  {active.short}
                </div>
                <div className="text-body-s text-ink-muted">
                  {active.platform} ·{' '}
                  {active.teamSize === 1 ? 'Solo' : `${active.teamSize}v${active.teamSize}`}
                </div>
              </div>
            </div>
          </HudPanel>
        </Reveal>
      </div>

      {/* Checklist ---------------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Pre-match"
          title={`${active.platform} readiness`}
          action={
            <span className="text-body-s text-ink-muted">
              {active.platform === 'Mobile'
                ? 'Thermals and battery matter more than frame pacing here'
                : 'Frame pacing and peripherals lead on this platform'}
            </span>
          }
        />
        <Reveal>
          <HudPanel className="p-6">
            <DiagnosticChecklist items={checks} />
          </HudPanel>
        </Reveal>
      </section>

      {/* Metrics ------------------------------------------------------------ */}
      <section>
        <HudSection eyebrow="Telemetry" title="Last hour" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <Reveal key={metric.label} delay={i * 70}>
              <HudPanel interactive className="p-4">
                <HudLabel>{metric.label}</HudLabel>
                <div className="mt-2 font-mono text-mono-l text-ink">{metric.value}</div>
              </HudPanel>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
