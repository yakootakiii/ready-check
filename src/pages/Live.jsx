import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameTile from '../components/GameTile'
import LiveViewer from '../components/LiveViewer'
import DiagnosticChecklist from '../components/DiagnosticChecklist'
import Reveal from '../components/Reveal'
import { Countdown, HudLabel, HudPageHeader, HudPanel, HudSection, LivePip } from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { ArrowRight, Bracket, Broadcast } from '../components/icons'
import { useLiveMatch } from '../live'
import { useGame } from '../gameContext'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { liveMatchesFor, teamsFor } from '../data/generate'
import { diagnosticsFor } from '../data/checks'
import { player } from '../data/mock'
import { tier as tierOf } from '../tiers'

export default function Live() {
  const { isLive, setIsLive } = useLiveMatch()
  const { game } = useGame()
  const navigate = useNavigate()

  const active = game ?? GAMES_BY_ID[player.primaryGameId]
  const matches = liveMatchesFor(active.id)
  const [feedId, setFeedId] = useState(matches[0].id)
  const feed = matches.find((m) => m.id === feedId) ?? matches[0]
  const diagnostics = diagnosticsFor(active.platform)
  const warnings = diagnostics.filter((d) => d.state !== 'pass')
  const opponent = teamsFor(active.id)[1]

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow={isLive ? 'Match in progress' : 'Standing by'}
        title={isLive ? `Live — ${feed.stageLabel}` : 'Match centre'}
        subtitle={`${active.name} · ${genreOf(active).label} · ${active.platform}`}
        action={
          <div className="flex flex-wrap gap-2">
            {isLive ? (
              <Button onClick={() => setIsLive(false)}>End match</Button>
            ) : (
              <Button variant="primary" onClick={() => setIsLive(true)}>
                <Broadcast />
                Go live
              </Button>
            )}
            <Button onClick={() => navigate(`/compete/brackets/${active.id}`)}>
              <Bracket />
              Bracket
            </Button>
          </div>
        }
      />

      {isLive ? (
        <Reveal>
          <LiveViewer match={feed} others={matches} onSelect={setFeedId} />
        </Reveal>
      ) : (
        <Reveal>
          <HudPanel className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <HudLabel>Next up</HudLabel>
                <div className="mt-2 font-display text-display-l font-bold text-ink">
                  vs. {opponent.name}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-body-m">
                  <GameTile game={active} size="s" />
                  <span className={tierOf(opponent.tier).text}>
                    {tierOf(opponent.tier).label}
                  </span>
                  <span className="text-ink-muted">
                    · {opponent.region} · {active.teamSize === 1 ? 'FT5' : 'Bo3'}
                  </span>
                </div>
              </div>
              <div>
                <HudLabel className="mb-2">Starts in</HudLabel>
                <Countdown seconds={11 * 3600 + 24 * 60} />
              </div>
            </div>
          </HudPanel>
        </Reveal>
      )}

      {/* Pre-match check ---------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow={`${active.platform} readiness`}
          title="Pre-match check"
          action={
            <Button variant="ghost" onClick={() => navigate('/compete/diagnostics')}>
              Full diagnostics
              <ArrowRight />
            </Button>
          }
        />
        <Reveal>
          <HudPanel className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <HudLabel>{diagnostics.length} checks</HudLabel>
              <span className={`text-body-m ${warnings.length ? 'text-ember' : 'text-ink-muted'}`}>
                {warnings.length
                  ? `${warnings.length} ${warnings.length === 1 ? 'needs' : 'need'} attention`
                  : 'All clear'}
              </span>
            </div>
            <DiagnosticChecklist items={diagnostics.slice(0, 6)} />
          </HudPanel>
        </Reveal>
      </section>

      {/* Comms -------------------------------------------------------------- */}
      <section>
        <HudSection eyebrow="Voice" title="Comms" />
        <Reveal>
          <HudPanel className="p-6">
            {isLive ? (
              <div className="flex flex-wrap items-center gap-6">
                <span className="flex items-center gap-2">
                  <LivePip className="text-signal" />
                  <span className="text-body-m text-ink">Connected to team channel</span>
                </span>
                <div className="flex items-center gap-2">
                  {['Kidlat', 'Bagsik', 'Tala', 'Hiraya', 'Bulkan']
                    .slice(0, Math.max(2, active.teamSize))
                    .map((name, i) => (
                      <span
                        key={name}
                        className={`rounded-base border px-2.5 py-1 text-body-s ${
                          i === 4
                            ? 'border-line text-ink-muted'
                            : 'border-signal/40 bg-signal/10 text-signal'
                        }`}
                      >
                        {name}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Comms open when the match starts."
                hint="Your team's voice channel connects automatically at map load."
              />
            )}
          </HudPanel>
        </Reveal>
      </section>
    </div>
  )
}
