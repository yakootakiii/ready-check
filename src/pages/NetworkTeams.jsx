import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameTile from '../components/GameTile'
import NetworkTabs from '../components/NetworkTabs'
import Reveal from '../components/Reveal'
import {
  FormRow,
  HudLabel,
  HudPageHeader,
  HudPanel,
  HudSection,
  LivePip,
  StatBar,
} from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { ArrowRight, Building, School, Search, Trophy, Users } from '../components/icons'
import { coverageKeyOf, genreOf } from '../data/games'
import { teamDna } from '../data/dna'
import { allTeams, findTeam, teamProfile } from '../data/league'
import { tier as tierOf } from '../tiers'
import { useGame } from '../gameContext'
/* Team cards lead with the identity the model composed rather than with the
 * record, on the titles the engine has actually been calibrated on. On the
 * other twenty they stay a record and a form line — inventing a profile for a
 * scene the model has not seen would undercut the one claim the product is
 * making.
 */

/** A gold/silver/bronze cue for a placement, so podiums read at a glance. */
export const placementTone = (placement) =>
  placement === '1st'
    ? 'text-gold'
    : placement === '2nd'
      ? 'text-silver'
      : placement === '3rd'
        ? 'text-bronze'
        : 'text-ink-muted'

export function BackerBadge({ backer, className = '' }) {
  const Icon = backer.type === 'school' ? School : Building
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-body-s ${
        backer.type === 'school'
          ? 'border-platinum text-platinum'
          : 'border-surface text-ink-muted'
      } ${className}`}
    >
      <Icon />
      {backer.short}
    </span>
  )
}

export function AccoladeRow({ accolade, showTeam = false }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <Trophy className={`shrink-0 ${placementTone(accolade.placement)}`} />
      <span
        className={`w-16 shrink-0 whitespace-nowrap font-mono text-mono-m ${placementTone(
          accolade.placement,
        )}`}
      >
        {accolade.placement}
      </span>
      <span className="min-w-0 flex-1 truncate text-body-m text-ink">
        {accolade.event}
        {showTeam && <span className="text-body-s text-ink-muted"> · {accolade.teamName}</span>}
      </span>
      <span className="font-mono text-mono-m text-ink-muted">{accolade.season}</span>
    </li>
  )
}

/* ---------------------------------------------------------------------------
   Directory
   --------------------------------------------------------------------------- */

const SORTS = {
  winRate: { label: 'Win rate', fn: (a, b) => b.winRate - a.winRate },
  titles: { label: 'Titles', fn: (a, b) => b.accolades.filter((x) => x.placement === '1st').length - a.accolades.filter((x) => x.placement === '1st').length },
  name: { label: 'Name', fn: (a, b) => a.name.localeCompare(b.name) },
}

function TeamDirectory() {
  const navigate = useNavigate()
  const { gameId, game, isAll } = useGame()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('winRate')
  const [backing, setBacking] = useState('all')

  const teams = useMemo(() => {
    const base = isAll ? allTeams() : allTeams().filter((t) => t.gameId === gameId)
    return base.map(teamProfile)
  }, [gameId, isAll])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return teams
      .filter((t) => backing === 'all' || t.backer.type === backing)
      .filter(
        (t) =>
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.backer.name.toLowerCase().includes(q) ||
          t.region.toLowerCase().includes(q) ||
          t.game.name.toLowerCase().includes(q),
      )
      .sort(SORTS[sort].fn)
  }, [teams, query, sort, backing])

  const schoolCount = teams.filter((t) => t.backer.type === 'school').length

  return (
    <div>
      <HudPageHeader
        eyebrow="Competitive network"
        title="Teams"
        subtitle={
          game
            ? `Every ${game.name} roster on the platform.`
            : 'Every roster on the platform, across all 25 titles.'
        }
        action={
          <span className="flex items-center gap-3 text-body-s text-ink-muted">
            <Users />
            {teams.length} teams · {schoolCount} school-backed
          </span>
        }
      />

      <NetworkTabs />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="flex min-w-56 flex-1 items-center gap-3 rounded-base border border-surface bg-surface px-3 py-2">
          <Search className="shrink-0 text-ink-muted" />
          <span className="sr-only">Search teams</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search team, backer, region or title"
            className="w-full bg-transparent text-body-m text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </label>

        {[
          { key: 'all', label: 'All' },
          { key: 'school', label: 'Schools' },
          { key: 'company', label: 'Companies' },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setBacking(opt.key)}
            className={`rounded-base border px-3 py-2 text-body-m transition-colors duration-150 btn-press ${
              backing === opt.key
                ? 'border-signal bg-raised text-ink'
                : 'border-surface bg-surface text-ink-muted hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        ))}

        <label className="flex items-center gap-2 rounded-base border border-surface bg-surface px-3 py-2">
          <span className="hud-label text-ink-muted">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-body-m text-ink focus:outline-none"
          >
            {Object.entries(SORTS).map(([key, s]) => (
              <option key={key} value={key} className="bg-raised">
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No teams match that search." hint="Try a region or a title name." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((team, i) => {
            const t = tierOf(team.tier)
            const top = team.accolades[0]
            return (
              <Reveal key={team.id} delay={Math.min(i, 11) * 45}>
                <HudPanel
                  as="button"
                  interactive
                  onClick={() => navigate(`/network/teams/${team.id}`)}
                  className="flex h-full w-full flex-col p-5 text-left"
                >
                  <div className="flex items-start gap-3">
                    <GameTile game={team.game} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-display-m font-semibold text-ink">
                        {team.name}
                      </div>
                      <div className={`truncate text-body-s ${genreOf(team.game).text}`}>
                        {team.game.short} · {team.region}
                      </div>
                    </div>
                    <BackerBadge backer={team.backer} />
                  </div>

                  {/* The identity the model composed, where a scene the engine
                      has been calibrated on can support one. On the other
                      twenty titles the card stays a record and a form line
                      rather than inventing a profile. */}
                  {coverageKeyOf(team.game) !== 'planned' && (
                    <div className="mt-3 truncate text-body-m text-signal">
                      {teamDna(team).identity}
                    </div>
                  )}

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="font-mono text-mono-l text-ink">{team.winRate}%</span>
                    <span className="font-mono text-mono-m text-ink-muted">{team.record}</span>
                  </div>
                  <div className="mt-2">
                    <StatBar pct={team.winRate} color={t.bg} delay={i * 45 + 200} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <FormRow form={team.form} />
                    <span className={`text-body-s ${t.text}`}>{t.label}</span>
                  </div>

                  <div className="mt-auto flex items-center gap-2 border-t border-surface pt-4 text-body-s">
                    {top ? (
                      <>
                        <Trophy className={`shrink-0 ${placementTone(top.placement)}`} />
                        <span className="min-w-0 flex-1 truncate text-ink-muted">
                          {top.placement} · {top.event}
                        </span>
                      </>
                    ) : (
                      <span className="flex-1 text-ink-muted">No placements yet</span>
                    )}
                    <ArrowRight className="shrink-0 text-signal" />
                  </div>
                </HudPanel>
              </Reveal>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Team detail
   --------------------------------------------------------------------------- */

function TeamDetail({ team }) {
  const navigate = useNavigate()
  const t = tierOf(team.tier)
  const backerRoute = team.backer.type === 'school' ? 'schools' : 'orgs'

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow={`${team.game.name} · ${team.region}`}
        title={team.name}
        subtitle={`Founded ${team.founded} · ${team.roster.length} active ${
          team.roster.length === 1 ? 'player' : 'players'
        }`}
        action={<Button onClick={() => navigate('/network/teams')}>All teams</Button>}
      />

      {/* Headline ----------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-4">
        {[
          { label: 'Win rate', value: `${team.winRate}%`, bar: team.winRate },
          { label: 'Record', value: team.record },
          { label: 'Streak', value: team.streak > 0 ? `${team.streak} wins` : 'None' },
          { label: 'Titles', value: team.accolades.filter((a) => a.placement === '1st').length },
        ].map((stat, i) => (
          <Reveal key={stat.label} delay={i * 70}>
            <HudPanel className="p-5">
              <HudLabel>{stat.label}</HudLabel>
              <div className="mt-2 font-display text-display-l font-bold text-ink">
                {stat.value}
              </div>
              {stat.bar !== undefined && (
                <div className="mt-3">
                  <StatBar pct={stat.bar} color={t.bg} delay={250} />
                </div>
              )}
            </HudPanel>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        {/* Roster ----------------------------------------------------------- */}
        <section>
          <HudSection
            eyebrow="Active roster"
            title={`${team.roster.length} on the sheet`}
            action={<span className={`text-body-s ${t.text}`}>{t.label}</span>}
          />
          <HudPanel className="divide-y divide-surface p-2">
            {team.roster.map((p, i) => (
              <Reveal key={p.id} delay={i * 60} className="flex items-center gap-4 px-3 py-3">
                <span className="w-6 font-mono text-mono-m text-ink-muted">{i + 1}</span>
                <span aria-hidden="true" className={`h-8 w-0.5 shrink-0 ${t.bg}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="truncate text-body-m text-ink">{p.name}</span>
                    {i === 0 && (
                      <span className="hud-label text-signal">Top rated</span>
                    )}
                  </div>
                  <div className="text-body-s text-ink-muted">{p.role}</div>
                </div>
                {/* Stat labels come from the title, not a fixed pair. */}
                <div className="hidden text-right sm:block">
                  {p.stats.map((stat) => (
                    <div key={stat.label} className="font-mono text-body-s text-ink-muted">
                      {stat.value} {stat.label}
                    </div>
                  ))}
                </div>
                <div className="w-16 text-right">
                  <div className="font-mono text-mono-m text-ink">{p.rating}</div>
                  <div
                    className={`font-mono text-body-s ${
                      p.delta >= 0 ? 'text-signal' : 'text-ink-muted'
                    }`}
                  >
                    {p.delta >= 0 ? '+' : ''}
                    {p.delta}
                  </div>
                </div>
              </Reveal>
            ))}
          </HudPanel>

          <div className="mt-8">
            <HudSection eyebrow="Honours" title={`${team.accolades.length} placements`} />
            <HudPanel className="p-4">
              {team.accolades.length ? (
                <ul className="divide-y divide-surface">
                  {team.accolades.map((a) => (
                    <AccoladeRow key={a.id} accolade={a} />
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-body-m text-ink-muted">
                  No placements yet — this roster is still building a record.
                </p>
              )}
            </HudPanel>
          </div>
        </section>

        {/* Context ---------------------------------------------------------- */}
        <section className="space-y-4">
          <Reveal>
            <HudPanel className="p-5">
              <HudLabel>{team.backer.type === 'school' ? 'Program of' : 'Operated by'}</HudLabel>
              <button
                type="button"
                onClick={() => navigate(`/network/${backerRoute}/${team.backer.id}`)}
                className="mt-3 flex w-full items-center gap-3 text-left transition-colors duration-150 btn-press hover:text-signal"
              >
                {team.backer.type === 'school' ? (
                  <School className="shrink-0 text-platinum" />
                ) : (
                  <Building className="shrink-0 text-ink-muted" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-display-m font-semibold text-ink">
                    {team.backer.name}
                  </span>
                  <span className="block text-body-s text-ink-muted">
                    {team.backer.city ?? team.backer.hq} · est. {team.backer.founded}
                  </span>
                </span>
                <ArrowRight className="shrink-0 text-signal" />
              </button>
            </HudPanel>
          </Reveal>

          <Reveal delay={80}>
            <HudPanel className="p-5">
              <HudLabel>Recent form</HudLabel>
              <div className="mt-3">
                <FormRow form={team.form} />
              </div>
              <p className="mt-3 text-body-s text-ink-muted">Most recent five, oldest first.</p>
            </HudPanel>
          </Reveal>

          <Reveal delay={160}>
            <HudPanel className="p-5">
              <HudLabel>Tournaments</HudLabel>
              <ul className="mt-3 space-y-3">
                {team.tournaments.map((event) => (
                  <li key={event.id} className="flex items-start gap-3">
                    {event.status === 'live' ? (
                      <LivePip />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-surface"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-m text-ink">{event.name}</span>
                      <span className="block text-body-s text-ink-muted">
                        {event.stage} · {event.window}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate(`/compete/tournaments/${team.gameId}`)}
              >
                View brackets
              </Button>
            </HudPanel>
          </Reveal>
        </section>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Router glue
   --------------------------------------------------------------------------- */

export default function NetworkTeams() {
  const { teamId } = useParams()

  if (teamId) {
    const team = findTeam(teamId)
    if (team) return <TeamDetail team={teamProfile(team)} />
  }

  return <TeamDirectory />
}
