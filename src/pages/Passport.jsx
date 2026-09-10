import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PlayerCard, { ProfileTabs } from '../components/PlayerCard'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import DnaRadar from '../components/DnaRadar'
import DnaDimensions from '../components/DnaDimensions'
import Sparkline from '../components/Sparkline'
import CoverageNote from '../components/CoverageNote'
import { VerifiedChip } from '../components/CompetitiveIdentity'
import { InsightBullet } from '../components/InsightCard'
import { FormRow, HudLabel, HudPageHeader, HudPanel, HudSection } from '../components/hud'
import { Button } from '../components/ui'
import { ArrowRight, Dna, Radar, Shield, Target, Trend } from '../components/icons'
import { useGame } from '../gameContext'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { PLAYER_DIMENSIONS, coreDimensionsFor, playerDna } from '../data/dna'
import { trajectoryFor } from '../data/talent'
import { findPlayer, playersFor, teamsFor } from '../data/generate'
import { teamProfile } from '../data/league'
import { achievementsFor, highlightVods, player, playerEntityFor, profileFor, teamHistoryFor } from '../data/mock'
import { AccoladeRow, placementTone } from './NetworkTeams'
import { tier as tierOf } from '../tiers'

/**
 * The Outplay Competitive Passport.
 *
 * A persistent competitive identity that travels with a player: who they are
 * as a competitor, what the model has watched them do, where they have played,
 * and which of their results were actually verified against a recorded
 * outcome. It replaces the old "my card" screen, and the difference is the
 * ordering - identity and DNA first, rank and win rate as supporting evidence.
 *
 * The same component serves the signed-in player and anyone found through the
 * Network, because a passport that looked different depending on who was
 * reading it would not be a passport.
 */
export default function Passport() {
  const navigate = useNavigate()
  const { playerId } = useParams()
  const { gameId } = useGame()

  const other = playerId ? findPlayer(playerId) : null
  return other ? (
    <VisitedPassport entry={other} onBack={() => navigate('/network')} />
  ) : (
    <OwnPassport seededGameId={gameId} />
  )
}

/* --- Someone else's passport ---------------------------------------------- */

function VisitedPassport({ entry, onBack }) {
  const navigate = useNavigate()
  const game = GAMES_BY_ID[entry.gameId]
  const dna = playerDna(entry)
  const trajectory = trajectoryFor(dna)

  // A ladder row is not a full person record, but the platform knows more
  // about them than the row itself carries: they play for a team, and that
  // team has a region, a record, a form line and a shelf of placements. So the
  // passport is assembled from the graph rather than padded out with fields it
  // would have to invent — and anything genuinely unknown (availability) is
  // left off instead of rendered as a dash.
  const team = teamsFor(entry.gameId).find((row) => row.name === entry.team)
  const roster = team ? teamProfile(team) : null
  const ladderRank = playersFor(entry.gameId).findIndex((row) => row.id === entry.id) + 1

  const asPlayer = {
    fullName: entry.name,
    handle: entry.name,
    initials: entry.name.slice(0, 2).toUpperCase(),
  }
  const asProfile = {
    gameId: entry.gameId,
    role: entry.role,
    tier: entry.tier,
    rating: entry.rating,
    region: team?.region ?? game.regions[0],
    availability: null,
    winRate: roster ? `${roster.winRate}%` : '—',
    matchesAnalyzed: dna.sample,
    stats: entry.stats,
  }

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Competitive passport"
        title={entry.name}
        subtitle={`${dna.identity} · ${entry.team} · ${game.name}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={onBack}>Back to players</Button>
            <Button variant="primary" onClick={() => navigate('/network/talent')}>
              Roster fit
            </Button>
          </div>
        }
      />

      <CoverageNote game={game} />

      <Reveal>
        <PlayerCard
          player={asPlayer}
          profile={asProfile}
          dna={dna}
          trajectory={trajectory}
          orgActions
          extraStats={[{ label: `${game.short} ladder`, value: `#${ladderRank}` }]}
        />
      </Reveal>

      <DnaSection dna={dna} />

      {/* What the graph knows about them ---------------------------------- */}
      {roster && (
        <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
          <section>
            <HudSection
              eyebrow="Current team"
              title={roster.name}
              action={
                <Button variant="ghost" onClick={() => navigate(`/network/teams/${roster.id}`)}>
                  Team page
                  <ArrowRight />
                </Button>
              }
            />
            <Reveal>
              <HudPanel className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-display-m font-semibold text-ink">
                      {roster.winRate}% win rate
                    </div>
                    <div className="mt-1 text-body-s">
                      <span className={tierOf(roster.tier).text}>
                        {tierOf(roster.tier).label}
                      </span>
                      <span className="text-ink-muted">
                        {' '}
                        · {roster.region} · {roster.record}
                      </span>
                    </div>
                  </div>
                  <FormRow form={roster.form} />
                </div>

                <div className="mt-5 border-t border-line pt-4">
                  <HudLabel className="mb-3">Alongside</HudLabel>
                  <ul className="space-y-2">
                    {roster.roster
                      .filter((member) => member.id !== entry.id)
                      .map((member) => (
                        <li key={member.id} className="flex items-center gap-3">
                          <span className="min-w-0 flex-1 truncate text-body-m text-ink-muted">
                            {member.name}
                          </span>
                          <span className="shrink-0 text-body-s text-ink-muted">
                            {member.role}
                          </span>
                          <span className="w-12 shrink-0 text-right font-mono text-mono-m text-ink">
                            {member.rating}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button onClick={() => navigate(`/matchup/opponents/${roster.id}`)}>
                    <Radar />
                    Scout this team
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/network/talent')}>
                    <Target />
                    Roster fit
                  </Button>
                </div>
              </HudPanel>
            </Reveal>
          </section>

          <section>
            <HudSection
              eyebrow="Verified record"
              title={
                roster.accolades.length
                  ? `${roster.accolades.length} placements`
                  : 'No placements yet'
              }
              action={
                <span className="flex items-center gap-2 text-body-s text-ink-muted">
                  <Shield />
                  Won with {roster.name}
                </span>
              }
            />
            <Reveal>
              <HudPanel className="p-5">
                {roster.accolades.length ? (
                  <ul className="divide-y divide-line">
                    {roster.accolades.map((accolade) => (
                      <AccoladeRow key={accolade.id} accolade={accolade} />
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-body-m text-ink-muted">
                    Nothing on the shelf yet. The profile above is built from{' '}
                    {dna.sample} analysed matches regardless — a record is not the only
                    evidence the model reads.
                  </p>
                )}

                <div className="mt-5 border-t border-line pt-4">
                  <HudLabel>Entered this season</HudLabel>
                  <ul className="mt-3 space-y-2">
                    {roster.tournaments.map((event) => (
                      <li key={event.id} className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={`h-5 w-1 shrink-0 rounded-full ${
                            event.status === 'live' ? 'bg-ember' : 'bg-line'
                          }`}
                        />
                        <span className="min-w-0 flex-1 truncate text-body-m text-ink">
                          {event.name}
                        </span>
                        <span className="shrink-0 text-body-s text-ink-muted">{event.stage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </HudPanel>
            </Reveal>
          </section>
        </div>
      )}
    </div>
  )
}

/* --- The signed-in player's passport --------------------------------------- */

function OwnPassport({ seededGameId }) {
  const navigate = useNavigate()
  const seeded = player.profiles.some((p) => p.gameId === seededGameId)
    ? seededGameId
    : player.primaryGameId
  const [activeGameId, setActiveGameId] = useState(seeded)

  const profile = profileFor(activeGameId)
  const game = GAMES_BY_ID[profile.gameId]
  const dna = playerDna(playerEntityFor(profile.gameId))
  const trajectory = trajectoryFor(dna)
  const achievements = achievementsFor(profile.gameId)
  const history = teamHistoryFor(profile.gameId)
  const org = teamsFor(profile.gameId)[0]

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Outplay competitive passport"
        title={player.handle}
        subtitle={`Issued ${player.passportSince}. This is what an organisation sees when they find you.`}
        action={<Button>Edit passport</Button>}
      />

      <ProfileTabs player={player} activeGameId={activeGameId} onSelect={setActiveGameId} />

      <CoverageNote game={game} />

      <Reveal key={activeGameId}>
        <PlayerCard
          player={player}
          profile={profile}
          dna={dna}
          trajectory={trajectory}
          highlights={highlightVods}
        />
      </Reveal>

      <DnaSection dna={dna} />

      {/* Record ------------------------------------------------------------- */}
      <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <section>
          <HudSection
            eyebrow="Verified record"
            title="Tournament history"
            action={
              <span className="flex items-center gap-2 text-body-s text-ink-muted">
                <Shield />
                Checked against recorded results
              </span>
            }
          />
          <HudPanel className="divide-y divide-line p-2">
            {achievements.map((achievement, i) => (
              <Reveal
                key={achievement.id}
                delay={i * 60}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-3"
              >
                <span
                  className={`w-16 shrink-0 font-display text-display-m font-bold ${placementTone(
                    achievement.placement,
                  )}`}
                >
                  {achievement.placement}
                </span>
                <span className="min-w-40 flex-1 truncate text-body-m text-ink">
                  {achievement.event}
                </span>
                <span className="font-mono text-mono-m text-ink-muted">{achievement.season}</span>
                <VerifiedChip verified={achievement.verified} className="w-28 justify-end" />
              </Reveal>
            ))}
          </HudPanel>

          <HudSection eyebrow="Where you have played" title="Team history" className="mt-8" />
          <HudPanel className="divide-y divide-line p-2">
            {history.map((row, i) => (
              <Reveal key={row.id} delay={i * 60} className="flex items-center gap-4 px-3 py-3">
                <span className="w-24 shrink-0 font-mono text-mono-m text-ink-muted">
                  {row.from}–{row.to ?? 'now'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-m text-ink">{row.team}</span>
                  <span className="block truncate text-body-s text-ink-muted">{row.role}</span>
                </span>
                {row.to === null && <span className="text-body-s text-edge">Current</span>}
              </Reveal>
            ))}
          </HudPanel>
        </section>

        <section>
          <HudSection eyebrow="Context" title="Where you sit" />
          <div className="grid gap-3">
            <Reveal>
              <HudPanel className="p-5">
                <HudLabel>Improvement trajectory</HudLabel>
                <div
                  className={`mt-2 font-display text-display-l font-bold ${
                    trajectory.tone === 'edge'
                      ? 'text-edge'
                      : trajectory.tone === 'ember'
                        ? 'text-ember'
                        : 'text-ink'
                  }`}
                >
                  {trajectory.label}
                </div>
                <p className="mt-2 text-body-m text-ink-muted">{trajectory.note}</p>
                <Button
                  variant="ghost"
                  className="mt-3 px-0"
                  onClick={() => navigate('/analyze/trends')}
                >
                  <Trend />
                  See the full history
                  <ArrowRight />
                </Button>
              </HudPanel>
            </Reveal>

            <Reveal delay={80}>
              <HudPanel className="p-5">
                <HudLabel>Scene leader</HudLabel>
                <div className="mt-2 font-display text-display-m font-semibold text-ink">
                  {org.name}
                </div>
                <div className="mt-1 text-body-s">
                  <span className={tierOf(org.tier).text}>{tierOf(org.tier).label}</span>
                  <span className="text-ink-muted">
                    {' '}
                    · {org.region} · {org.record}
                  </span>
                </div>
                <p className="mt-3 text-body-s text-ink-muted">
                  The top side in {game.short}. Your own team's profile lives under Analyze.
                </p>
              </HudPanel>
            </Reveal>

            <Reveal delay={160}>
              <HudPanel className="p-5">
                <HudLabel>Titles you compete in</HudLabel>
                <ul className="mt-3 space-y-2">
                  {player.profiles.map((p) => {
                    const g = GAMES_BY_ID[p.gameId]
                    const pt = tierOf(p.tier)
                    return (
                      <li key={p.gameId} className="flex items-center gap-3">
                        <GameTile game={g} size="s" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body-m text-ink">{g.short}</span>
                          <span className="block truncate text-body-s text-ink-muted">
                            {p.role} · since {p.since}
                          </span>
                        </span>
                        <span className={`text-body-s ${pt.text}`}>{pt.label}</span>
                        <span className="font-mono text-mono-m text-ink-muted">{p.rating}</span>
                      </li>
                    )
                  })}
                </ul>
                <p className="mt-3 border-t border-line pt-3 text-body-s text-ink-muted">
                  {genreOf(game).label} · {game.platform}
                </p>
              </HudPanel>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  )
}

/* --- Shared: the DNA block on any passport --------------------------------- */

function DnaSection({ dna }) {
  const navigate = useNavigate()
  const core = coreDimensionsFor('player')

  return (
    <section>
      <HudSection
        eyebrow="Competitive DNA"
        title="How they compete"
        action={
          <Button variant="ghost" onClick={() => navigate('/analyze')}>
            <Dna />
            Open analysis
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,22rem)_1fr]">
        <Reveal>
          <HudPanel className="flex h-full items-center justify-center p-6">
            <DnaRadar
              dimensions={PLAYER_DIMENSIONS}
              series={[{ key: 'you', label: dna.name, values: dna.values, tone: 'signal' }]}
              size={300}
              labels="short"
            />
          </HudPanel>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal delay={80}>
            <HudPanel className="h-full p-5">
              <HudLabel className="text-edge">Strengths</HudLabel>
              <ul className="mt-3 space-y-2">
                {dna.traits.map((trait) => (
                  <InsightBullet key={trait} tone="edge">
                    {trait}
                  </InsightBullet>
                ))}
              </ul>
              <div className="mt-5 border-t border-line pt-4">
                <HudLabel className="text-ember">Development priorities</HudLabel>
                <ul className="mt-3 space-y-2">
                  {dna.weaknesses.map((weakness) => (
                    <InsightBullet key={weakness} tone="ember">
                      {weakness}
                    </InsightBullet>
                  ))}
                </ul>
              </div>
            </HudPanel>
          </Reveal>

          <Reveal delay={160}>
            <HudPanel className="h-full p-5">
              <HudLabel>Performance trend</HudLabel>
              <ul className="mt-4 space-y-3">
                {core.map((dim) => {
                  const points = dna.history.map((frame) => frame.values[dim.key])
                  const delta = dna.deltas[dim.key]
                  return (
                    <li key={dim.key} className="flex items-center gap-3">
                      <span className="min-w-0 flex-1 truncate text-body-m text-ink-muted">
                        {dim.label}
                      </span>
                      <Sparkline
                        points={points}
                        stroke={delta < -1 ? 'var(--color-ember)' : 'var(--color-signal)'}
                      />
                      <span className="w-8 text-right font-mono text-mono-m text-ink">
                        {dna.values[dim.key]}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </HudPanel>
          </Reveal>
        </div>
      </div>

      <Reveal className="mt-4">
        <HudPanel className="p-6">
          <HudLabel>Every dimension</HudLabel>
          <DnaDimensions
            dna={dna}
            deltas={dna.deltas}
            className="mt-4 sm:columns-2 sm:gap-x-10 [&>li]:break-inside-avoid [&>li]:pb-3"
          />
        </HudPanel>
      </Reveal>
    </section>
  )
}
