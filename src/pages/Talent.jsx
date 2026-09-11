import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameTile from '../components/GameTile'
import NetworkTabs from '../components/NetworkTabs'
import Reveal from '../components/Reveal'
import { DnaStrip } from '../components/DnaDimensions'
import InsightCard, { InsightBullet } from '../components/InsightCard'
import CoverageNote from '../components/CoverageNote'
import { FormRow, HudLabel, HudPageHeader, HudPanel, HudSection, StatBar } from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { ArrowRight, Search, Sparkle, Target, Users } from '../components/icons'
import { useGame } from '../gameContext'
import { GAMES_BY_ID } from '../data/games'
import { teamsFor } from '../data/generate'
import { myTeam } from '../data/matchup'
import { candidatesFor, emergingFor, fitFor, rosterGapsFor } from '../data/talent'
import { player, playerEntityFor, profileFor } from '../data/mock'
import { tier as tierOf } from '../tiers'

/**
 * Talent intelligence - recruitment posed as a compatibility question.
 *
 * The old screen was a search box over a list of orgs: type a rank, get the
 * same twenty names everyone else gets. This one starts from a roster's own
 * Competitive DNA, states what that roster is actually missing, and ranks
 * players by whether they fill it. A Gold-tier support who closes the exact
 * gap outranks a Diamond duelist who duplicates the strongest seat, and the
 * reasons under each score say why - a compatibility number nobody can
 * interrogate is just a rank with extra steps.
 *
 * Two directions, because the same model answers both: an org looking for a
 * player, and a player looking for a roster whose shape needs theirs.
 */
const MODES = [
  { key: 'recruit', label: 'Recruit for my team', icon: Users },
  { key: 'join', label: 'Find a roster', icon: Target },
]

/** Score chip: a compatibility read, never presented as a rating. */
function FitScore({ score, className = '' }) {
  const tone = score >= 80 ? 'text-edge' : score >= 62 ? 'text-signal' : 'text-ink-muted'
  return (
    <span className={`text-right ${className}`}>
      <span className={`block font-display text-display-l font-bold ${tone}`}>{score}%</span>
      <span className="block text-body-s text-ink-muted">roster fit</span>
    </span>
  )
}

export default function Talent() {
  const navigate = useNavigate()
  const { game } = useGame()
  const active = game ?? GAMES_BY_ID[player.primaryGameId]

  const [mode, setMode] = useState('recruit')
  const [query, setQuery] = useState('')

  const team = myTeam(active.id)
  const gaps = rosterGapsFor(team)
  const profile = profileFor(active.id)

  const candidates = useMemo(() => {
    const rows = candidatesFor(team, { limit: 9 })
    const q = query.trim().toLowerCase()
    return q
      ? rows.filter((row) =>
          `${row.player.name} ${row.player.role} ${row.dna.identity}`.toLowerCase().includes(q),
        )
      : rows
  }, [team, query])

  // The mirror direction: rosters whose gaps this player's own profile fills.
  const rosters = useMemo(() => {
    const me = playerEntityFor(active.id)
    return teamsFor(active.id)
      .map((row) => ({ fit: fitFor(me, row), team: row, gaps: rosterGapsFor(row) }))
      .sort((a, b) => b.fit.score - a.fit.score)
      .slice(0, 6)
  }, [active.id])

  const emerging = emergingFor(active.id)

  return (
    <div>
      <NetworkTabs />

      <HudPageHeader
        eyebrow="Talent intelligence"
        title="Compatibility, not rank"
        subtitle="Roster gaps read from Competitive DNA, and players ranked by whether they close them."
        action={
          <span className="flex items-center gap-2 rounded-base border border-surface bg-surface px-3 py-2 text-body-m text-ink-muted">
            <GameTile game={active} size="s" />
            {active.name}
          </span>
        }
      />

      <CoverageNote game={active} className="mb-6" />

      <div className="mb-6 flex flex-wrap gap-2">
        {MODES.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setMode(option.key)}
            aria-pressed={mode === option.key}
            className={`flex items-center gap-2 rounded-base border px-3 py-2 text-body-m transition-colors duration-150 btn-press ${
              mode === option.key
                ? 'border-signal bg-raised text-ink'
                : 'border-surface bg-surface text-ink-muted hover:text-ink'
            }`}
          >
            <option.icon />
            {option.label}
          </button>
        ))}
      </div>

      {mode === 'recruit' ? (
        <div className="space-y-10">
          {/* The brief ------------------------------------------------------- */}
          <Reveal>
            <HudPanel className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-56 flex-1">
                  <HudLabel className="text-signal">Roster brief</HudLabel>
                  <div className="mt-1.5 font-display text-display-l font-bold text-ink">
                    {team.name} needs
                  </div>
                  <p className="mt-1 text-body-m text-ink-muted">
                    {gaps.dna.identity} · {team.record} · {team.region}
                  </p>
                </div>
                <FormRow form={team.form} />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {gaps.needs.map((need, i) => (
                  <div key={need.key} className="rounded-base border border-surface bg-raised p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <HudLabel className="text-ink-muted">{need.label}</HudLabel>
                      <span className="font-mono text-mono-m text-ember">{need.value}</span>
                    </div>
                    <div className="mt-2">
                      <StatBar pct={need.value} color="bg-ember" delay={160 + i * 80} />
                    </div>
                    <p className="mt-3 text-body-m text-ink">{need.brief}.</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-surface pt-4">
                <span className="text-body-s text-ink-muted">
                  Strongest already:{' '}
                  <span className="text-edge">
                    {gaps.strengths.map((s) => s.label.toLowerCase()).join(', ')}
                  </span>
                  . Do not sign more of it.
                </span>
                {gaps.openRoles.length > 0 && (
                  <span className="text-body-s text-ink-muted">
                    Open seats:{' '}
                    <span className="text-ink">{gaps.openRoles.join(', ')}</span>
                  </span>
                )}
              </div>
            </HudPanel>
          </Reveal>

          {/* Candidates ------------------------------------------------------- */}
          <section>
            <HudSection
              eyebrow="Recommended"
              title="Players who complement this roster"
              action={
                <label className="flex min-w-56 items-center gap-3 rounded-base border border-surface bg-surface px-3 py-2">
                  <Search className="shrink-0 text-ink-muted" />
                  <span className="sr-only">Search candidates</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search candidates"
                    className="w-full bg-transparent text-body-m text-ink placeholder:text-ink-muted focus:outline-none"
                  />
                </label>
              }
            />

            {candidates.length === 0 ? (
              <EmptyState
                title="No candidate matches that search."
                hint="Try a role, or an identity word like 'consistent'."
              />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {candidates.map((candidate, i) => {
                  const t = tierOf(candidate.player.tier)
                  return (
                    <Reveal key={candidate.player.id} delay={Math.min(i, 8) * 60}>
                      <HudPanel
                        as="button"
                        interactive
                        corners={false}
                        onClick={() => navigate(`/passport/${candidate.player.id}`)}
                        className="flex h-full w-full flex-col p-5 text-left"
                      >
                        <span className="flex items-start justify-between gap-4">
                          <span className="min-w-0">
                            <span className="block truncate font-display text-display-m font-semibold text-ink">
                              {candidate.player.name}
                            </span>
                            <span className="mt-0.5 block truncate text-body-m text-signal">
                              {candidate.dna.identity}
                            </span>
                            <span className="mt-0.5 block truncate text-body-s text-ink-muted">
                              {candidate.player.role} · {candidate.player.team} ·{' '}
                              <span className={t.text}>{t.label}</span>
                            </span>
                          </span>
                          <FitScore score={candidate.score} className="shrink-0" />
                        </span>

                        <DnaStrip dna={candidate.dna} className="mt-4" />

                        <span className="mt-4 block border-t border-surface pt-3">
                          <ul className="space-y-2">
                            {candidate.reasons.map((reason) => (
                              <InsightBullet key={reason.key} tone="edge">
                                {reason.text}
                              </InsightBullet>
                            ))}
                            {candidate.concerns.map((concern) => (
                              <InsightBullet key={concern.key} tone="ember">
                                {concern.text}
                              </InsightBullet>
                            ))}
                          </ul>
                        </span>

                        <span className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface pt-3">
                          <span className="text-body-s text-ink-muted">
                            Gap fit {candidate.needScore} · Style fit {candidate.styleScore} ·
                            Role fit {candidate.roleScore}
                          </span>
                          <span
                            className={`text-body-s ${
                              candidate.trajectory.tone === 'edge'
                                ? 'text-edge'
                                : candidate.trajectory.tone === 'ember'
                                  ? 'text-ember'
                                  : 'text-ink-muted'
                            }`}
                          >
                            {candidate.trajectory.label}
                          </span>
                        </span>
                      </HudPanel>
                    </Reveal>
                  )
                })}
              </div>
            )}
          </section>

          {/* Emerging --------------------------------------------------------- */}
          <section>
            <HudSection
              eyebrow="Development trajectory"
              title="Emerging talent"
              action={
                <span className="text-body-s text-ink-muted">
                  Profiles climbing faster than their rating implies
                </span>
              }
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {emerging.map((row, i) => (
                <Reveal key={row.player.id} delay={i * 70}>
                  <HudPanel
                    as="button"
                    interactive
                    corners={false}
                    onClick={() => navigate(`/passport/${row.player.id}`)}
                    className="w-full p-4 text-left"
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-display text-display-m font-semibold text-ink">
                        {row.player.name}
                      </span>
                      <span className="shrink-0 font-mono text-body-s text-edge">
                        +{row.trajectory.drift}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-body-s text-signal">
                      {row.dna.identity}
                    </span>
                    <span className="mt-3 block text-body-s text-ink-muted">
                      {row.trajectory.note}
                    </span>
                  </HudPanel>
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* The mirror: rosters that need what this player has ----------------- */
        <div className="space-y-8">
          <InsightCard
            tone="signal"
            eyebrow="Reading it the other way"
            title={`Rosters whose gaps ${player.handle}'s profile closes.`}
            body={`Same model, run in reverse: your Competitive DNA as a ${profile.role} against what each side in ${active.name} is actually missing.`}
            source={`Your ${active.short} passport`}
            action="Open passport"
            onAction={() => navigate('/passport')}
          />

          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {rosters.map((row, i) => (
              <Reveal key={row.team.id} delay={Math.min(i, 6) * 70}>
                <HudPanel
                  as="button"
                  interactive
                  corners={false}
                  onClick={() => navigate(`/network/teams/${row.team.id}`)}
                  className="flex h-full w-full flex-col p-5 text-left"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="min-w-0">
                      <span className="block truncate font-display text-display-m font-semibold text-ink">
                        {row.team.name}
                      </span>
                      <span className="mt-0.5 block truncate text-body-m text-signal">
                        {row.gaps.dna.identity}
                      </span>
                      <span className="mt-0.5 block truncate text-body-s text-ink-muted">
                        {row.team.record} · {row.team.region}
                      </span>
                    </span>
                    <FitScore score={row.fit.score} className="shrink-0" />
                  </span>

                  <span className="mt-4 block border-t border-surface pt-3">
                    <HudLabel className="text-ink-muted">What they need</HudLabel>
                    <ul className="mt-2 space-y-1.5">
                      {row.gaps.needs.slice(0, 2).map((need) => (
                        <InsightBullet key={need.key} tone="ember">
                          {need.brief}
                        </InsightBullet>
                      ))}
                    </ul>
                  </span>

                  <span className="mt-4 block border-t border-surface pt-3">
                    <HudLabel className="text-edge">Why you fit</HudLabel>
                    <ul className="mt-2 space-y-1.5">
                      {row.fit.reasons.length > 0 ? (
                        row.fit.reasons.map((reason) => (
                          <InsightBullet key={reason.key} tone="edge">
                            {reason.text}
                          </InsightBullet>
                        ))
                      ) : (
                        <InsightBullet tone="muted">
                          No standout complement. You would be competing on level terms here.
                        </InsightBullet>
                      )}
                    </ul>
                  </span>
                </HudPanel>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 flex items-center gap-2 text-body-s text-ink-muted">
        <Sparkle />
        Fit is a compatibility read, not a rating. It answers "does this profile close what this
        roster is missing", which is a different question from "who is the best player available".
        <Button variant="ghost" onClick={() => navigate('/analyze')} className="px-2 py-0">
          How DNA is built
          <ArrowRight />
        </Button>
      </p>
    </div>
  )
}
