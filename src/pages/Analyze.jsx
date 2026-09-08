import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Reveal from '../components/Reveal'
import GameTile from '../components/GameTile'
import DnaRadar, { RadarLegend } from '../components/DnaRadar'
import DnaDimensions from '../components/DnaDimensions'
import CompetitiveIdentity from '../components/CompetitiveIdentity'
import CoverageNote from '../components/CoverageNote'
import InsightCard, { InsightBullet } from '../components/InsightCard'
import { HudLabel, HudPageHeader, HudPanel, HudSection } from '../components/hud'
import { Button } from '../components/ui'
import { ArrowRight, Layers, Target, Trend } from '../components/icons'
import { useGame } from '../gameContext'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { dimensionsFor, playerDna } from '../data/dna'
import { myDna, nextFixture, styleProfile } from '../data/matchup'
import { player, playerEntityFor, profileFor } from '../data/mock'

/**
 * Competitive DNA in full.
 *
 * The screen is built around one claim: a competitor is a shape, not a score.
 * So the radar leads at full size with all twelve dimensions labelled, the
 * ordered list sits beside it carrying the numbers and what each dimension
 * actually measures, and the identity the model composed sits above both.
 *
 * Two subjects share the screen because they are genuinely different objects:
 * a team's DNA is about how five people move together, a player's about what
 * they contribute to that. Tabbing between them rather than merging them keeps
 * the twelve dimensions meaning one thing each.
 */
const SUBJECTS = [
  { key: 'team', label: 'Team DNA' },
  { key: 'player', label: 'Your player DNA' },
]

export default function Analyze() {
  const navigate = useNavigate()
  const { game } = useGame()
  const active = game ?? GAMES_BY_ID[player.primaryGameId]
  const profile = profileFor(active.id)

  const [subject, setSubject] = useState('team')
  const teamDnaProfile = myDna(active.id)
  const playerDnaProfile = playerDna(playerEntityFor(active.id))
  const dna = subject === 'team' ? teamDnaProfile : playerDnaProfile

  const dimensions = dimensionsFor(dna.kind)
  const fixture = nextFixture(active.id)
  const style = styleProfile(teamDnaProfile)

  const series = [
    {
      key: 'now',
      label: `Now · ${dna.history[dna.history.length - 1].label}`,
      values: dna.values,
      tone: 'signal',
    },
    {
      key: 'then',
      label: `${dna.history[0].label} · six months ago`,
      values: dna.history[0].values,
      tone: 'muted',
      ghost: true,
    },
  ]

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Competitive DNA"
        title={subject === 'team' ? `How ${teamDnaProfile.name} competes` : `How ${player.handle} competes`}
        subtitle="Twelve behavioural dimensions, modelled from analysed matches. Read as a shape, not a score."
        action={
          <span className="flex items-center gap-2 rounded-base border border-line bg-surface/85 px-3 py-2 text-body-m text-ink-muted">
            <GameTile game={active} size="s" />
            {active.name}
          </span>
        }
      />

      <CoverageNote game={active} />

      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSubject(option.key)}
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
        <span className="flex items-center gap-2 px-2 text-body-s text-ink-muted">
          {subject === 'team'
            ? `${teamDnaProfile.team.record} · ${teamDnaProfile.team.region}`
            : `${profile.role} · ${profile.region} · ${genreOf(active).label}`}
        </span>
      </div>

      {/* The profile ------------------------------------------------------- */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]" key={subject}>
        <Reveal>
          <HudPanel className="flex h-full flex-col items-center justify-center p-6">
            <DnaRadar dimensions={dimensions} series={series} size={420} labels="full" />
            <RadarLegend series={series} className="mt-6 justify-center" />
            <p className="mt-3 max-w-sm text-center text-body-s text-ink-muted">
              The dashed outline is the same profile six months ago. The gap between the two
              is what the last two splits changed.
            </p>
          </HudPanel>
        </Reveal>

        <div className="grid gap-4">
          <Reveal delay={80}>
            <HudPanel className="p-6">
              <CompetitiveIdentity dna={dna} size="l" showWeakness />
            </HudPanel>
          </Reveal>

          <Reveal delay={160}>
            <HudPanel className="p-6">
              <HudLabel className="text-signal">Style interaction</HudLabel>
              <p className="mt-3 text-body-l text-ink">
                {subject === 'team'
                  ? `${teamDnaProfile.name} performs better against ${style.beats}.`
                  : `${player.handle} is at their best alongside a side that plays to ${style.beats}.`}
              </p>
              <p className="mt-2 text-body-m text-ink-muted">
                The same shape struggles against {style.struggles}.
              </p>
              <Button
                variant="ghost"
                className="mt-4 px-0"
                onClick={() => navigate('/matchup')}
              >
                <Target />
                See it against {fixture.opponent.name}
                <ArrowRight />
              </Button>
            </HudPanel>
          </Reveal>
        </div>
      </div>

      {/* Every dimension ---------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Every dimension"
          title="What the model measured"
          action={
            <Button variant="ghost" onClick={() => navigate('/analyze/trends')}>
              <Trend />
              How it moved
            </Button>
          }
        />
        <Reveal>
          <HudPanel className="p-6">
            <DnaDimensions
              dna={dna}
              deltas={dna.deltas}
              showBlurb
              className="sm:columns-2 sm:gap-x-10 [&>li]:break-inside-avoid [&>li]:pb-3"
            />
          </HudPanel>
        </Reveal>
      </section>

      {/* What the shape means ------------------------------------------------ */}
      <section>
        <HudSection eyebrow="Reading the shape" title="What this profile implies" />
        <div className="grid gap-4 lg:grid-cols-3">
          {subject === 'team' ? (
            <>
              <Reveal>
                <HudPanel className="h-full p-5">
                  <HudLabel className="text-edge">Win condition</HudLabel>
                  <p className="mt-3 text-body-l text-ink">
                    {teamDnaProfile.name} wins by {teamDnaProfile.winCondition}.
                  </p>
                </HudPanel>
              </Reveal>
              <Reveal delay={80}>
                <HudPanel className="h-full p-5">
                  <HudLabel className="text-ember">Role reliance</HudLabel>
                  <div className="mt-2 font-display text-display-l font-bold text-ink">
                    {teamDnaProfile.roleReliance.level}
                  </div>
                  <p className="mt-2 text-body-m text-ink-muted">
                    {teamDnaProfile.roleReliance.note}
                  </p>
                </HudPanel>
              </Reveal>
              <Reveal delay={160}>
                <HudPanel className="h-full p-5">
                  <HudLabel>Where it is soft</HudLabel>
                  <ul className="mt-3 space-y-2">
                    {teamDnaProfile.weaknesses.map((weakness) => (
                      <InsightBullet key={weakness} tone="ember">
                        {weakness}
                      </InsightBullet>
                    ))}
                  </ul>
                </HudPanel>
              </Reveal>
            </>
          ) : (
            <>
              <Reveal>
                <HudPanel className="h-full p-5">
                  <HudLabel className="text-signal">Role archetype</HudLabel>
                  <div className="mt-2 font-display text-display-l font-bold text-ink">
                    {playerDnaProfile.archetype.label}
                  </div>
                  <p className="mt-2 text-body-m text-ink-muted">
                    Modelled from {profile.role} play in {active.name}. The archetype sets the
                    baseline the profile is measured against, so a support is not marked down
                    for playing less forward than a duelist.
                  </p>
                </HudPanel>
              </Reveal>
              <Reveal delay={80}>
                <HudPanel className="h-full p-5">
                  <HudLabel className="text-edge">Strongest three</HudLabel>
                  <ul className="mt-3 space-y-2">
                    {playerDnaProfile.ordered.slice(0, 3).map((dim) => (
                      <li key={dim.key} className="flex items-baseline justify-between gap-3">
                        <span className="text-body-m text-ink">{dim.label}</span>
                        <span className="font-mono text-mono-m text-edge">{dim.value}</span>
                      </li>
                    ))}
                  </ul>
                </HudPanel>
              </Reveal>
              <Reveal delay={160}>
                <HudPanel className="h-full p-5">
                  <HudLabel className="text-ember">Development priorities</HudLabel>
                  <ul className="mt-3 space-y-2">
                    {playerDnaProfile.weaknesses.map((weakness) => (
                      <InsightBullet key={weakness} tone="ember">
                        {weakness}
                      </InsightBullet>
                    ))}
                  </ul>
                </HudPanel>
              </Reveal>
            </>
          )}
        </div>
      </section>

      <Reveal>
        <InsightCard
          tone="signal"
          eyebrow="Where this came from"
          title={`This profile was rebuilt from ${dna.sample} analysed matches.`}
          body="Every result feeds back into it. Match analysis shows what the model expected against what actually happened, and which tendencies it learned from the gap."
          source="Continuous learning loop"
          action="Open match analysis"
          onAction={() => navigate('/analyze/matches')}
        />
      </Reveal>

      <p className="flex items-center gap-2 text-body-s text-ink-muted">
        <Layers />
        Competitive DNA updates after every analysed match. A single result moves a dimension
        by a point or two — anything larger would be fitting noise.
      </p>
    </div>
  )
}
