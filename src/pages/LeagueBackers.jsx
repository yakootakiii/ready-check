import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameTile from '../components/GameTile'
import LeagueTabs from '../components/LeagueTabs'
import Reveal from '../components/Reveal'
import {
  HudLabel,
  HudPageHeader,
  HudPanel,
  HudSection,
  LivePip,
  StatBar,
} from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { AccoladeRow, placementTone } from './League'
import { ArrowRight, Building, School, Search, Trophy, Users } from '../components/icons'
import { genreOf } from '../data/games'
import { backerProfile, companiesWithRosters, schoolsWithRosters } from '../data/league'
import { tier as tierOf } from '../tiers'

/**
 * Schools and companies share a shape — both back rosters across titles — so
 * they share this screen. `kind` only changes the copy, the icon and which
 * pool is listed.
 */
const KINDS = {
  school: {
    eyebrow: 'League',
    title: 'Schools',
    subtitle: 'Universities and colleges fielding an active esports roster.',
    icon: School,
    pool: schoolsWithRosters,
    placeLabel: 'Campus',
    place: (b) => b.city,
    route: 'schools',
    empty: 'No school matches that search.',
  },
  company: {
    eyebrow: 'League',
    title: 'Organizations',
    subtitle: 'Companies operating rosters across the circuit.',
    icon: Building,
    pool: companiesWithRosters,
    placeLabel: 'HQ',
    place: (b) => b.hq,
    route: 'orgs',
    empty: 'No organization matches that search.',
  },
}

/* ---------------------------------------------------------------------------
   Directory
   --------------------------------------------------------------------------- */

function BackerDirectory({ kind }) {
  const navigate = useNavigate()
  const config = KINDS[kind]
  const [query, setQuery] = useState('')

  const backers = useMemo(() => config.pool(), [config])
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return backers.filter(
      (b) =>
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.short.toLowerCase().includes(q) ||
        config.place(b).toLowerCase().includes(q) ||
        b.games.some((g) => g.name.toLowerCase().includes(q)),
    )
  }, [backers, query, config])

  const totalPlayers = backers.reduce((sum, b) => sum + b.players, 0)

  return (
    <div>
      <HudPageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        subtitle={config.subtitle}
        action={
          <span className="flex items-center gap-3 text-body-s text-ink-muted">
            <Users />
            {backers.length} programs · {totalPlayers} players
          </span>
        }
      />

      <LeagueTabs />

      <label className="mb-5 flex items-center gap-3 rounded-base border border-line bg-surface/85 px-3 py-2">
        <Search className="shrink-0 text-ink-muted" />
        <span className="sr-only">Search {config.title.toLowerCase()}</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search name, ${config.placeLabel.toLowerCase()} or title`}
          className="w-full bg-transparent text-body-m text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </label>

      {visible.length === 0 ? (
        <EmptyState title={config.empty} hint="Try a city or a game name." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((backer, i) => {
            const top = backer.accolades[0]
            return (
              <Reveal key={backer.id} delay={Math.min(i, 10) * 55}>
                <HudPanel
                  as="button"
                  interactive
                  onClick={() => navigate(`/league/${config.route}/${backer.id}`)}
                  className="flex h-full w-full flex-col p-5 text-left"
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center border border-platinum/40 font-display text-body-m font-bold text-platinum"
                      style={{ clipPath: 'polygon(22% 0, 100% 0, 100% 78%, 78% 100%, 0 100%, 0 22%)' }}
                    >
                      {backer.short}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-display-m font-semibold text-ink">
                        {backer.name}
                      </div>
                      <div className="truncate text-body-s text-ink-muted">
                        {config.place(backer)} · est. {backer.founded}
                      </div>
                    </div>
                    {backer.titles > 0 && (
                      <span
                        title={`${backer.titles} championships won`}
                        className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/50 px-2.5 py-0.5 text-body-s text-gold"
                      >
                        <Trophy />
                        {backer.titles}
                      </span>
                    )}
                  </div>

                  {/* Which titles the program actually fields. */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {backer.games.map((g) => (
                      <GameTile key={g.id} game={g} size="s" />
                    ))}
                    <span className="ml-1 text-body-s text-ink-muted">
                      {backer.games.length} {backer.games.length === 1 ? 'game' : 'games'}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-3 border-t border-line pt-4">
                    <div>
                      <HudLabel>Teams</HudLabel>
                      <div className="mt-1 font-mono text-mono-m text-ink">{backer.teams.length}</div>
                    </div>
                    <div>
                      <HudLabel>Players</HudLabel>
                      <div className="mt-1 font-mono text-mono-m text-ink">{backer.players}</div>
                    </div>
                    <div>
                      <HudLabel>Win rate</HudLabel>
                      <div className="mt-1 font-mono text-mono-m text-signal">{backer.winRate}%</div>
                    </div>
                    <div>
                      <HudLabel>Running</HudLabel>
                      <div className="mt-1 font-mono text-mono-m text-ember">
                        {backer.running.length}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <StatBar pct={backer.winRate} color="bg-platinum" delay={i * 55 + 200} />
                  </div>

                  <div className="mt-auto flex items-center gap-2 border-t border-line pt-4 text-body-s">
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
   Detail
   --------------------------------------------------------------------------- */

function BackerDetail({ backer }) {
  const navigate = useNavigate()
  const config = KINDS[backer.type]
  const Icon = config.icon

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow={`${backer.type === 'school' ? 'School program' : 'Organization'} · ${config.place(
          backer,
        )}`}
        title={backer.name}
        subtitle={`Est. ${backer.founded} · ${backer.teams.length} rosters across ${
          backer.games.length
        } ${backer.games.length === 1 ? 'title' : 'titles'}`}
        action={
          <Button onClick={() => navigate(`/league/${config.route}`)}>
            All {config.title.toLowerCase()}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          { label: 'Win rate', value: `${backer.winRate}%`, bar: backer.winRate },
          { label: 'Record', value: `${backer.wins}-${backer.losses}` },
          { label: 'Active players', value: backer.players },
          { label: 'Titles won', value: backer.titles },
        ].map((stat, i) => (
          <Reveal key={stat.label} delay={i * 70}>
            <HudPanel className="p-5">
              <HudLabel>{stat.label}</HudLabel>
              <div className="mt-2 font-display text-display-l font-bold text-ink">
                {stat.value}
              </div>
              {stat.bar !== undefined && (
                <div className="mt-3">
                  <StatBar pct={stat.bar} color="bg-platinum" delay={250} />
                </div>
              )}
            </HudPanel>
          </Reveal>
        ))}
      </div>

      {/* Rosters ------------------------------------------------------------ */}
      <section>
        <HudSection
          eyebrow="Rosters"
          title={`${backer.teams.length} teams`}
          action={
            <span className="flex items-center gap-2 text-body-s text-ink-muted">
              <Icon />
              {backer.games.map((g) => g.short).join(' · ')}
            </span>
          }
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {backer.teams.map((team, i) => {
            const t = tierOf(team.tier)
            return (
              <Reveal key={team.id} delay={i * 60}>
                <HudPanel
                  as="button"
                  interactive
                  onClick={() => navigate(`/league/team/${team.id}`)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start gap-3">
                    <GameTile game={team.game} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-display-m font-semibold text-ink">
                        {team.name}
                      </div>
                      <div className={`truncate text-body-s ${genreOf(team.game).text}`}>
                        {team.game.name} · {team.region}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-mono-m text-ink">{team.winRate}%</div>
                      <div className="font-mono text-body-s text-ink-muted">{team.record}</div>
                    </div>
                  </div>

                  {/* Members, with roles — the sheet a coach would read. */}
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {team.roster.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-base border border-line bg-raised/60 px-2 py-1 text-body-s text-ink-muted"
                      >
                        <span className="text-ink">{p.name}</span> · {p.role}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className={`text-body-s ${t.text}`}>{t.label}</span>
                    <span className="text-body-s text-ink-muted">
                      {team.accolades.length}{' '}
                      {team.accolades.length === 1 ? 'placement' : 'placements'}
                    </span>
                  </div>
                </HudPanel>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Honours + fixtures -------------------------------------------------- */}
      <div className="grid gap-8 xl:grid-cols-2">
        <section>
          <HudSection eyebrow="Honours" title={`${backer.accolades.length} placements`} />
          <HudPanel className="p-4">
            {backer.accolades.length ? (
              <ul className="divide-y divide-line">
                {backer.accolades.slice(0, 10).map((a) => (
                  <AccoladeRow key={a.id} accolade={a} showTeam />
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-body-m text-ink-muted">
                No placements yet.
              </p>
            )}
          </HudPanel>
        </section>

        <section>
          <HudSection eyebrow="Fixtures" title="Running and pending" />
          <div className="grid gap-3">
            <Reveal>
              <HudPanel className="p-5">
                <div className="flex items-center gap-2">
                  <LivePip />
                  <HudLabel className="text-ember">Running now</HudLabel>
                </div>
                <ul className="mt-3 space-y-2">
                  {backer.running.length ? (
                    backer.running.slice(0, 5).map((event) => (
                      <li key={event.id} className="flex items-center gap-3">
                        <span className="min-w-0 flex-1 truncate text-body-m text-ink">
                          {event.name}
                        </span>
                        <span className="shrink-0 font-mono text-body-s text-ink-muted">
                          {event.stage}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-body-m text-ink-muted">Nothing under way.</li>
                  )}
                </ul>
              </HudPanel>
            </Reveal>

            <Reveal delay={80}>
              <HudPanel className="p-5">
                <HudLabel>Pending and upcoming</HudLabel>
                <ul className="mt-3 space-y-2">
                  {backer.pending.slice(0, 6).map((event) => (
                    <li key={event.id} className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          event.status === 'open' ? 'bg-signal' : 'bg-line'
                        }`}
                      />
                      <span className="min-w-0 flex-1 truncate text-body-m text-ink">
                        {event.name}
                      </span>
                      <span className="shrink-0 text-body-s text-ink-muted">{event.window}</span>
                    </li>
                  ))}
                </ul>
              </HudPanel>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Router glue
   --------------------------------------------------------------------------- */

export default function LeagueBackers({ kind }) {
  const { backerId } = useParams()

  if (backerId) {
    const backer = backerProfile(backerId)
    if (backer && backer.type === kind) return <BackerDetail backer={backer} />
  }

  return <BackerDirectory kind={kind} />
}
