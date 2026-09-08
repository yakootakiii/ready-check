import { useMemo, useState } from 'react'
import PlayerCard from '../components/PlayerCard'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import { FormRow, HudLabel, HudPageHeader, HudPanel, HudSection } from '../components/hud'
import { Button } from '../components/ui'
import { Search } from '../components/icons'
import { highlightVods, player, profileFor } from '../data/mock'
import { teamsFor } from '../data/generate'
import { GAMES, GAMES_BY_ID, genreOf } from '../data/games'
import { tier as tierOf } from '../tiers'
import { useGame } from '../gameContext'

/** Deterministic per-org detail lines, so listings read like real postings. */
function listingFor(team) {
  const game = GAMES_BY_ID[team.gameId]
  const seed = team.id.length + team.name.charCodeAt(0) + team.region.charCodeAt(0)
  const notes = [
    'Semi-pro roster, 4 nights a week',
    'Building a second team for open qualifiers',
    'Coach-led, VOD review every session',
    'Amateur, weekend scrims only',
    'Academy pipeline into the main roster',
  ]
  return {
    looking: game.roles[seed % game.roles.length],
    note: notes[seed % notes.length],
  }
}

export default function OrgSearch() {
  const { gameId, game, isAll } = useGame()
  const [query, setQuery] = useState('')
  const [applied, setApplied] = useState([])

  const orgs = useMemo(() => {
    // Across titles, take a diagonal slice - the nth title's nth-ranked team.
    // Sorting by record instead would return every scene's strongest roster,
    // and the whole board would read Diamond.
    const rows = isAll
      ? GAMES.slice(0, 12).map((g, i) => teamsFor(g.id)[i % 8])
      : teamsFor(gameId)
    return rows.map((team) => ({ ...team, ...listingFor(team) }))
  }, [gameId, isAll])

  const visible = orgs.filter((org) =>
    `${org.name} ${org.looking} ${org.region} ${GAMES_BY_ID[org.gameId].name}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  const profile = profileFor(game ? game.id : player.primaryGameId)

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Recruit"
        title="Org search"
        subtitle={
          game
            ? `Teams recruiting in ${game.name}.`
            : 'Teams recruiting across every title on the platform.'
        }
        action={
          <span className="flex items-center gap-2 text-body-s text-ink-muted">
            {game && <GameTile game={game} size="s" />}
            {visible.length} listings
          </span>
        }
      />

      <label className="flex items-center gap-3 rounded-base border border-line bg-surface/85 px-3 py-2">
        <Search className="shrink-0 text-ink-muted" />
        <span className="sr-only">Search organizations</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by org, role, region or title"
          className="w-full bg-transparent text-body-m text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((org, i) => {
          const g = GAMES_BY_ID[org.gameId]
          const t = tierOf(org.tier)
          const done = applied.includes(org.id)
          return (
            <Reveal key={org.id} delay={Math.min(i, 9) * 60}>
              <HudPanel interactive className="flex h-full flex-col p-5">
                <div className="flex items-start gap-3">
                  <GameTile game={g} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-display-m font-semibold text-ink">
                      {org.name}
                    </div>
                    <div className={`truncate text-body-s ${genreOf(g).text}`}>
                      {g.short} · {org.region}
                    </div>
                  </div>
                  <span className={`shrink-0 text-body-s ${t.text}`}>{t.label}</span>
                </div>

                <p className="mt-4 text-body-m text-ink-muted">{org.note}</p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <HudLabel>Looking for</HudLabel>
                    <div className="mt-1 text-body-m text-ink">{org.looking}</div>
                  </div>
                  <div className="text-right">
                    <HudLabel>Record</HudLabel>
                    <div className="mt-1 font-mono text-mono-m text-ink">{org.record}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <HudLabel className="mb-2">Recent form</HudLabel>
                  <FormRow form={org.form} />
                </div>

                <Button
                  variant={done ? 'ghost' : 'secondary'}
                  disabled={done}
                  onClick={() => setApplied((list) => [...list, org.id])}
                  className="mt-5 w-full"
                >
                  {done ? 'Application sent' : 'Apply'}
                </Button>
              </HudPanel>
            </Reveal>
          )
        })}
      </div>

      {visible.length === 0 && (
        <HudPanel className="p-8 text-center">
          <p className="text-body-m text-ink-muted">No orgs match that search.</p>
        </HudPanel>
      )}

      <section>
        <HudSection eyebrow="Your listing" title="How orgs see you" />
        <Reveal>
          <PlayerCard player={player} profile={profile} highlights={highlightVods} orgActions />
        </Reveal>
      </section>
    </div>
  )
}
