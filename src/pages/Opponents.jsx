import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import DnaRadar, { RadarLegend } from '../components/DnaRadar'
import DnaDimensions, { DnaStrip } from '../components/DnaDimensions'
import MatchupBars from '../components/MatchupBars'
import HeadToHead from '../components/HeadToHead'
import CompetitiveIdentity from '../components/CompetitiveIdentity'
import CoverageNote from '../components/CoverageNote'
import { InsightBullet } from '../components/InsightCard'
import { FormRow, HudLabel, HudPageHeader, HudPanel, HudSection } from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { ArrowRight, Search, Target } from '../components/icons'
import { useGame } from '../gameContext'
import { GAMES_BY_ID } from '../data/games'
import { TEAM_DIMENSIONS, teamDna } from '../data/dna'
import { headToHeadFor, matchupFor, myDna, MY_TEAM_INDEX } from '../data/matchup'
import { findTeam, teamProfile } from '../data/league'
import { teamsFor } from '../data/generate'
import { player } from '../data/mock'
import { tier as tierOf } from '../tiers'

/**
 * Scouting: every side in the scene, read as a style rather than as a record.
 *
 * The list is deliberately not sorted by rating. It is sorted by how awkward
 * each opponent is for *you* - the team ranked below you whose shape happens
 * to counter yours is the more useful row, and a ladder-ordered list would
 * bury it. Each card leads with the identity the model composed, because
 * "Aggressive Fast Starter" tells a captain more than "18-6" does.
 */

const VERDICT = {
  you: { label: 'Favourable', text: 'text-edge', rule: 'bg-edge' },
  them: { label: 'Difficult', text: 'text-ember', rule: 'bg-ember' },
  even: { label: 'Even', text: 'text-ink-muted', rule: 'bg-line' },
}

const verdictOf = (matchup) => {
  const net = matchup.projection.winPct
  return net >= 56 ? VERDICT.you : net <= 44 ? VERDICT.them : VERDICT.even
}

/* --- One opponent --------------------------------------------------------- */

function OpponentProfile({ team, onBack }) {
  const navigate = useNavigate()
  const game = GAMES_BY_ID[team.gameId]
  const mine = myDna(team.gameId)
  const theirs = teamDna(team)
  const m = matchupFor(mine, theirs)
  const profile = teamProfile(team)
  const h2h = headToHeadFor(team.gameId, team.id)

  const series = [
    { key: 'them', label: team.name, values: theirs.values, tone: 'ember' },
    { key: 'you', label: `${mine.name} — you`, values: mine.values, tone: 'signal', ghost: true },
  ]
  const verdict = verdictOf(m)

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Opponent profile"
        title={team.name}
        subtitle={`${theirs.identity} · ${team.region} · ${team.record}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={onBack}>All opponents</Button>
            <Button variant="primary" onClick={() => navigate('/matchup')}>
              <Target />
              Full matchup
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,24rem)_1fr]">
        <Reveal>
          <HudPanel className="flex h-full flex-col items-center p-6">
            <DnaRadar dimensions={TEAM_DIMENSIONS} series={series} size={340} labels="short" />
            <RadarLegend series={series} className="mt-5 justify-center" />
          </HudPanel>
        </Reveal>

        <div className="grid gap-4">
          <Reveal delay={80}>
            <HudPanel className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <CompetitiveIdentity dna={theirs} className="min-w-56 flex-1" />
                <div className="text-right">
                  <HudLabel className={verdict.text}>{verdict.label} matchup</HudLabel>
                  <div className="mt-1 font-display text-display-xl font-bold text-ink">
                    {m.projection.winPct}%
                  </div>
                  <p className="text-body-s text-ink-muted">
                    your series, ± {m.projection.band}
                  </p>
                  <FormRow form={team.form} className="mt-4 justify-end" />
                </div>
              </div>
            </HudPanel>
          </Reveal>

          <Reveal delay={160}>
            <HudPanel className="p-6">
              <HudLabel>Tactical tendencies</HudLabel>
              <ul className="mt-3 space-y-2.5">
                {m.theirStrengths.map((item) => (
                  <InsightBullet key={item.key} tone="ember">
                    {item.text}
                  </InsightBullet>
                ))}
                {m.theirExploitable.map((item) => (
                  <InsightBullet key={item.key} tone="edge">
                    {item.text}
                  </InsightBullet>
                ))}
              </ul>
              <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                <div>
                  <HudLabel>Expected tempo</HudLabel>
                  <p className="mt-1 font-mono text-mono-m text-ink">{m.expectedTempo.label}</p>
                  <p className="mt-1 text-body-s text-ink-muted">{m.expectedTempo.note}</p>
                </div>
                <div>
                  <HudLabel>Role reliance</HudLabel>
                  <p className="mt-1 font-mono text-mono-m text-ink">{m.roleReliance.level}</p>
                  <p className="mt-1 text-body-s text-ink-muted">{m.roleReliance.note}</p>
                </div>
              </div>
            </HudPanel>
          </Reveal>
        </div>
      </div>

      <section>
        <HudSection eyebrow="Head to head" title={`${mine.name} against ${team.name}`} />
        <div className="grid gap-4 xl:grid-cols-2">
          <Reveal>
            <HudPanel className="h-full p-6">
              <MatchupBars
                dimensions={m.dimensions}
                youLabel={mine.name}
                themLabel={team.name}
              />
            </HudPanel>
          </Reveal>
          {h2h && (
            <Reveal delay={90}>
              <HeadToHead h2h={h2h} className="h-full" />
            </Reveal>
          )}
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
        <section>
          <HudSection eyebrow="Their profile" title="Every dimension" />
          <Reveal>
            <HudPanel className="p-6">
              <DnaDimensions dna={theirs} deltas={theirs.deltas} />
            </HudPanel>
          </Reveal>
        </section>

        <section>
          <HudSection
            eyebrow="Roster"
            title={`Who plays for ${team.name}`}
            action={
              <Button variant="ghost" onClick={() => navigate(`/network/teams/${team.id}`)}>
                Team page
                <ArrowRight />
              </Button>
            }
          />
          <Reveal>
            <HudPanel className="divide-y divide-line p-2">
              {profile.roster.map((member) => {
                const t = tierOf(member.tier)
                return (
                  <div key={member.id} className="flex items-center gap-3 px-3 py-3">
                    <span aria-hidden="true" className={`h-8 w-0.5 shrink-0 ${t.bg}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body-m text-ink">{member.name}</div>
                      <div className="truncate text-body-s text-ink-muted">{member.role}</div>
                    </div>
                    <span className="font-mono text-mono-m text-ink-muted">{member.rating}</span>
                  </div>
                )
              })}
            </HudPanel>
          </Reveal>

          <Reveal delay={90}>
            <HudPanel className="mt-4 p-5">
              <HudLabel>Win condition</HudLabel>
              <p className="mt-2 text-body-m text-ink">
                {team.name} wins by {theirs.winCondition}.
              </p>
              <p className="mt-3 border-t border-line pt-3 text-body-s text-ink-muted">
                Modelled on {theirs.sample} analysed {game.unit.toLowerCase()}s. Confidence{' '}
                {theirs.confidence}%.
              </p>
            </HudPanel>
          </Reveal>
        </section>
      </div>
    </div>
  )
}

/* --- The scouting list ---------------------------------------------------- */

export default function Opponents() {
  const navigate = useNavigate()
  const { teamId } = useParams()
  const { game } = useGame()
  const active = game ?? GAMES_BY_ID[player.primaryGameId]

  const [query, setQuery] = useState('')
  const [order, setOrder] = useState('difficulty')

  const rows = useMemo(() => {
    const mine = myDna(active.id)
    const scouted = teamsFor(active.id)
      .filter((_, i) => i !== MY_TEAM_INDEX)
      .map((team) => {
        const theirs = teamDna(team)
        return { team, dna: theirs, matchup: matchupFor(mine, theirs) }
      })

    const sorted =
      order === 'difficulty'
        ? [...scouted].sort((a, b) => a.matchup.projection.winPct - b.matchup.projection.winPct)
        : [...scouted].sort((a, b) => b.dna.confidence - a.dna.confidence)

    const q = query.trim().toLowerCase()
    return q
      ? sorted.filter((row) =>
          `${row.team.name} ${row.dna.identity} ${row.team.region}`.toLowerCase().includes(q),
        )
      : sorted
  }, [active.id, order, query])

  const selected = teamId ? findTeam(teamId) : null
  if (selected) {
    return <OpponentProfile team={selected} onBack={() => navigate('/matchup/opponents')} />
  }

  return (
    <div className="space-y-8">
      <HudPageHeader
        eyebrow="Scouting"
        title="Opponents"
        subtitle="Every side in the scene, read as a style. Ordered by how awkward each one is for your profile."
        action={
          <span className="flex items-center gap-2 rounded-base border border-line bg-surface/85 px-3 py-2 text-body-m text-ink-muted">
            <GameTile game={active} size="s" />
            {active.name}
          </span>
        }
      />

      <CoverageNote game={active} />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-56 flex-1 items-center gap-3 rounded-base border border-line bg-surface/85 px-3 py-2">
          <Search className="shrink-0 text-ink-muted" />
          <span className="sr-only">Search opponents</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by team, identity or region"
            className="w-full bg-transparent text-body-m text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </label>
        <Button onClick={() => setOrder((v) => (v === 'difficulty' ? 'confidence' : 'difficulty'))}>
          {order === 'difficulty' ? 'Hardest matchup first' : 'Best-modelled first'}
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No opponent matches that search."
          hint="Try a region, or one of the identity words like 'aggressive' or 'late'."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {rows.map((row, i) => {
            const verdict = verdictOf(row.matchup)
            const t = tierOf(row.team.tier)
            const concern = row.matchup.primaryConcern
            const edge = row.matchup.primaryEdge

            return (
              <Reveal key={row.team.id} delay={Math.min(i, 8) * 60}>
                <HudPanel
                  as="button"
                  interactive
                  corners={false}
                  onClick={() => navigate(`/matchup/opponents/${row.team.id}`)}
                  className="flex h-full w-full gap-4 p-5 text-left"
                >
                  <span aria-hidden="true" className={`w-0.5 shrink-0 rounded-full ${verdict.rule}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-display text-display-m font-semibold text-ink">
                        {row.team.name}
                      </span>
                      <span className={`hud-label ${verdict.text}`}>{verdict.label}</span>
                    </span>

                    <span className="mt-1 block text-body-m text-signal">{row.dna.identity}</span>
                    <span className="mt-1 block text-body-s text-ink-muted">
                      {row.team.record} · <span className={t.text}>{t.label}</span> ·{' '}
                      {row.team.region}
                    </span>

                    <DnaStrip dna={row.dna} className="mt-4" />

                    <span className="mt-4 block space-y-1.5 border-t border-line pt-3">
                      {concern && (
                        <span className="block text-body-s text-ink-muted">
                          <span className="text-ember">Concern</span> · {concern.label} (
                          {concern.them} vs your {concern.you})
                        </span>
                      )}
                      {edge && (
                        <span className="block text-body-s text-ink-muted">
                          <span className="text-edge">Edge</span> · {edge.label} ({edge.you} vs
                          their {edge.them})
                        </span>
                      )}
                    </span>
                  </span>
                </HudPanel>
              </Reveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
