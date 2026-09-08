import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameTile from '../components/GameTile'
import LiveViewer from '../components/LiveViewer'
import DiagnosticChecklist from '../components/DiagnosticChecklist'
import Reveal from '../components/Reveal'
import { MatchupMeter } from '../components/MatchupBars'
import { InsightBullet } from '../components/InsightCard'
import {
  Countdown,
  FormRow,
  HudLabel,
  HudPageHeader,
  HudPanel,
  HudSection,
  LivePip,
} from '../components/hud'
import { Button, EmptyState } from '../components/ui'
import { ArrowRight, Bracket, Broadcast, Target } from '../components/icons'
import { useLiveMatch } from '../live'
import { useGame } from '../gameContext'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { liveMatchesFor } from '../data/generate'
import { nextFixture } from '../data/matchup'
import { diagnosticsFor } from '../data/checks'
import { player } from '../data/mock'

/**
 * The match centre: the screen that is open while a series is being played.
 *
 * What is new here is the pre-match brief. In the old product this screen
 * checked your ping and your microphone and then wished you luck; the useful
 * thing to have on screen ten minutes before a game is what the opponent is
 * likely to do and the one dimension you are behind on. Hardware checks are
 * still here - they matter - but they are now the second panel rather than the
 * only one.
 */
export default function MatchCentre() {
  const { isLive, setIsLive } = useLiveMatch()
  const { game } = useGame()
  const navigate = useNavigate()

  const active = game ?? GAMES_BY_ID[player.primaryGameId]
  const matches = liveMatchesFor(active.id)
  const [feedId, setFeedId] = useState(matches[0].id)
  const feed = matches.find((m) => m.id === feedId) ?? matches[0]

  const diagnostics = diagnosticsFor(active.platform)
  const warnings = diagnostics.filter((d) => d.state !== 'pass')

  const fixture = nextFixture(active.id)
  const m = fixture.matchup

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
            <Button onClick={() => navigate(`/compete/tournaments/${active.id}`)}>
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
              <div className="min-w-56">
                <HudLabel>Next up</HudLabel>
                <div className="mt-2 font-display text-display-l font-bold text-ink">
                  vs. {fixture.opponent.name}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-body-m">
                  <GameTile game={active} size="s" />
                  <span className="text-signal">{m.theirs.identity}</span>
                  <span className="text-ink-muted">
                    · {fixture.opponent.region} · {fixture.format}
                  </span>
                </div>
                <FormRow form={fixture.opponent.form} className="mt-4" />
              </div>
              <div>
                <HudLabel className="mb-2">Starts in</HudLabel>
                <Countdown seconds={fixture.startsInSeconds} />
              </div>
            </div>
          </HudPanel>
        </Reveal>
      )}

      {/* The brief ---------------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow="Ten minutes out"
          title="Pre-match brief"
          action={
            <Button variant="ghost" onClick={() => navigate('/matchup')}>
              Full matchup intelligence
              <ArrowRight />
            </Button>
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <Reveal>
            <HudPanel className="h-full p-5">
              <HudLabel className="text-ember">Their game</HudLabel>
              <ul className="mt-3 space-y-2.5">
                {m.theirStrengths.map((item) => (
                  <InsightBullet key={item.key} tone="ember">
                    {item.text}
                  </InsightBullet>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-body-s text-ink-muted">
                Expected tempo: <span className="text-ink">{m.expectedTempo.label}</span>.{' '}
                {m.expectedTempo.note}
              </p>
            </HudPanel>
          </Reveal>

          <Reveal delay={80}>
            <HudPanel className="h-full p-5">
              <HudLabel className="text-edge">Where you are ahead</HudLabel>
              <div className="mt-3 space-y-4">
                {m.dimensions
                  .filter((d) => d.favour !== 'even')
                  .slice(0, 3)
                  .map((dim) => (
                    <MatchupMeter key={dim.key} dimension={dim} />
                  ))}
              </div>
            </HudPanel>
          </Reveal>

          <Reveal delay={160}>
            <HudPanel className="h-full p-5">
              <HudLabel>The one thing</HudLabel>
              <p className="mt-3 text-body-l text-ink">
                {m.prepFocus[0]?.action ?? 'No dimension where they hold a meaningful advantage.'}
              </p>
              <Button
                variant="ghost"
                className="mt-4 px-0"
                onClick={() => navigate(`/matchup/opponents/${fixture.opponent.id}`)}
              >
                <Target />
                Their full profile
                <ArrowRight />
              </Button>
            </HudPanel>
          </Reveal>
        </div>
      </section>

      {/* Setup -------------------------------------------------------------- */}
      <section>
        <HudSection
          eyebrow={`${active.platform} hardware`}
          title="Setup check"
          action={
            <Button variant="ghost" onClick={() => navigate('/compete/setup')}>
              Full check
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
                  <LivePip className="text-edge" />
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
