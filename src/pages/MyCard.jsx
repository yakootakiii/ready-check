import { useState } from 'react'
import PlayerCard, { ProfileTabs } from '../components/PlayerCard'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import { FormRow, HudLabel, HudPageHeader, HudPanel, HudSection, StatBar } from '../components/hud'
import { Button } from '../components/ui'
import { highlightVods, player, profileFor } from '../data/mock'
import { playersFor, teamsFor } from '../data/generate'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { tier as tierOf } from '../tiers'
import { useGame } from '../gameContext'

/**
 * The public Profile page: the same PlayerCard the Recruit module shows, just
 * without the org-facing actions (spec §5.5). A player competes in more than
 * one title, so the page is scoped by which of their profiles is selected -
 * seeded from the globally selected game when they play it.
 */
export default function MyCard() {
  const { gameId } = useGame()
  const seeded = player.profiles.some((p) => p.gameId === gameId) ? gameId : player.primaryGameId
  const [activeGameId, setActiveGameId] = useState(seeded)

  const profile = profileFor(activeGameId)
  const game = GAMES_BY_ID[profile.gameId]
  const ladder = playersFor(profile.gameId).slice(0, 5)
  const topRating = ladder[0].rating
  const org = teamsFor(profile.gameId)[0]

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Public profile"
        title="My card"
        subtitle="This is what orgs see when they find you."
        action={<Button>Edit card</Button>}
      />

      <ProfileTabs player={player} activeGameId={activeGameId} onSelect={setActiveGameId} />

      <Reveal key={activeGameId}>
        <PlayerCard player={player} profile={profile} highlights={highlightVods} />
      </Reveal>

      <div className="grid gap-8 xl:grid-cols-[1.3fr_1fr]">
        <section>
          <HudSection
            eyebrow="Ladder"
            title={`${game.short} — ${profile.region}`}
            action={
              <span className="flex items-center gap-2 text-body-s text-ink-muted">
                <GameTile game={game} size="s" />
                {genreOf(game).label}
              </span>
            }
          />
          <HudPanel className="divide-y divide-line p-2">
            {ladder.map((entry, i) => {
              const t = tierOf(entry.tier)
              return (
                <Reveal key={entry.id} delay={i * 70} className="flex items-center gap-4 px-3 py-3">
                  <span className="w-6 font-display text-display-m font-bold text-ink-muted">
                    {i + 1}
                  </span>
                  <span aria-hidden="true" className={`h-8 w-0.5 shrink-0 ${t.bg}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="truncate text-body-m text-ink">{entry.name}</span>
                      <span className="truncate text-body-s text-ink-muted">
                        {entry.team} · {entry.role}
                      </span>
                    </div>
                    <div className="mt-2">
                      <StatBar
                        pct={(entry.rating / topRating) * 100}
                        color={t.bg}
                        delay={i * 70 + 200}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <div className="font-mono text-mono-m text-ink">{entry.rating}</div>
                    <div
                      className={`font-mono text-body-s ${
                        entry.delta >= 0 ? 'text-signal' : 'text-ember'
                      }`}
                    >
                      {entry.delta >= 0 ? '+' : ''}
                      {entry.delta}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </HudPanel>
        </section>

        <section>
          <HudSection eyebrow="Context" title="Where you sit" />
          <div className="grid gap-3">
            <Reveal>
              <HudPanel className="p-5">
                <HudLabel>Current org</HudLabel>
                <div className="mt-2 font-display text-display-m font-semibold text-ink">
                  {org.name}
                </div>
                <div className="mt-1 text-body-s">
                  <span className={tierOf(org.tier).text}>{tierOf(org.tier).label}</span>
                  <span className="text-ink-muted"> · {org.region} · {org.record}</span>
                </div>
                <div className="mt-4">
                  <HudLabel className="mb-2">Recent form</HudLabel>
                  <FormRow form={org.form} />
                </div>
              </HudPanel>
            </Reveal>

            <Reveal delay={90}>
              <HudPanel className="p-5">
                <HudLabel>Titles you compete in</HudLabel>
                <ul className="mt-3 space-y-2">
                  {player.profiles.map((p) => {
                    const g = GAMES_BY_ID[p.gameId]
                    const pt = tierOf(p.tier)
                    return (
                      <li key={p.gameId} className="flex items-center gap-3">
                        <GameTile game={g} size="s" />
                        <span className="min-w-0 flex-1 truncate text-body-m text-ink">
                          {g.short}
                        </span>
                        <span className={`text-body-s ${pt.text}`}>{pt.label}</span>
                        <span className="font-mono text-mono-m text-ink-muted">{p.rating}</span>
                      </li>
                    )
                  })}
                </ul>
              </HudPanel>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  )
}
