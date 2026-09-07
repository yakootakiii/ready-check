import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AngularPanel from '../components/AngularPanel'
import GameTile from '../components/GameTile'
import Reveal from '../components/Reveal'
import {
  AnimatedNumber,
  Countdown,
  FormRow,
  Gauge,
  HudLabel,
  HudPageHeader,
  HudPanel,
  HudSection,
  LivePip,
  StatBar,
} from '../components/hud'
import Sparkline from '../components/Sparkline'
import { Button } from '../components/ui'
import { ArrowRight, Broadcast, Calendar, Film, Heart, Play, Search } from '../components/icons'
import { useLiveMatch } from '../live'
import { useGame } from '../gameContext'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { liveMatchesFor, openScrimsFor, playersFor, teamsFor } from '../data/generate'
import { player, profileFor, readiness, vodNotes, wellness } from '../data/mock'
import { tier as tierOf } from '../tiers'

/** Today, as a schedule rather than a list of cards. */
function scheduleFor(game, scrims) {
  return [
    { id: 'sch1', time: '4:00 PM', label: 'VOD review — rotations', kind: 'Prep', to: '/prep/vod' },
    {
      id: 'sch2',
      time: '6:30 PM',
      label: `Scrim vs. ${scrims[0].team}`,
      kind: 'Scrim',
      to: '/prep/scrims',
    },
    {
      id: 'sch3',
      time: '7:00 PM',
      label: `${game.short} playoffs — round 2`,
      kind: 'Match',
      to: '/compete/live',
      highlight: true,
    },
    { id: 'sch4', time: '9:30 PM', label: 'Cooldown + sleep window', kind: 'Wellness', to: '/prep/wellness' },
  ]
}

export default function Overview() {
  const { game } = useGame()
  const { setIsLive } = useLiveMatch()
  const navigate = useNavigate()

  const active = game ?? GAMES_BY_ID[player.primaryGameId]
  const profile = profileFor(active.id)
  const t = tierOf(profile.tier)

  const scrims = useMemo(() => openScrimsFor(active.id), [active.id])
  const [invites, setInvites] = useState(() =>
    scrims.slice(0, 3).map((s) => ({ id: s.id, team: s.team, tier: s.tier, time: s.starts })),
  )
  const opponent = teamsFor(active.id)[1]
  const ladder = playersFor(active.id).slice(0, 3)
  const liveNow = liveMatchesFor(active.id)[0]
  const schedule = scheduleFor(active, scrims)

  const dismiss = (id) => setInvites((list) => list.filter((i) => i.id !== id))
  const startMatch = () => {
    setIsLive(true)
    navigate('/compete/live')
  }

  const tone = readiness.score >= 75 ? 'signal' : 'ember'

  return (
    <div className="space-y-10">
      <HudPageHeader
        eyebrow="Your dashboard"
        title={`Good evening, ${player.firstName}`}
        subtitle={`${profile.role} · ${profile.region} · ${genreOf(active).label}`}
        action={
          <span className="flex items-center gap-2 rounded-base border border-line bg-surface/85 px-3 py-2 text-body-m text-ink-muted">
            <GameTile game={active} size="s" />
            {active.name}
          </span>
        }
      />

      {/* Readiness + next match ------------------------------------------- */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Reveal>
          <HudPanel className="h-full p-6">
            <HudLabel>Readiness</HudLabel>
            <div className="mt-4 flex flex-wrap items-center gap-8">
              <Gauge value={readiness.score} tone={tone}>
                <span className="font-display text-display-xl font-bold text-ink">
                  <AnimatedNumber value={readiness.score} />
                </span>
                <span className="hud-label text-ink-muted">of 100</span>
              </Gauge>

              <div className="min-w-40 flex-1">
                <p className="text-body-l text-ink">{readiness.reason}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Sparkline points={readiness.trend} />
                  <span className="text-body-s text-signal">Trending up this week</span>
                </div>

                <ul className="mt-5 space-y-3">
                  {readiness.factors.map((factor, i) => (
                    <li key={factor.label}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-body-s text-ink-muted">{factor.label}</span>
                        <span
                          className={`font-mono text-mono-m ${
                            factor.state === 'warn' ? 'text-ember' : 'text-ink'
                          }`}
                        >
                          {factor.value}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <StatBar
                          pct={factor.state === 'warn' ? 88 : 62}
                          color={factor.state === 'warn' ? 'bg-ember' : 'bg-signal'}
                          delay={300 + i * 90}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </HudPanel>
        </Reveal>

        <Reveal delay={90}>
          <AngularPanel
            accent="signal"
            fill="bg-surface/85"
            className="h-full"
            innerClassName="scanlines flex h-full flex-col p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <HudLabel className="text-ember">Next match</HudLabel>
              <span className="text-body-s text-ink-muted">
                {active.teamSize === 1 ? 'FT5' : 'Bo3'} · Playoffs round 2
              </span>
            </div>

            <div className="mt-3 font-display text-display-l font-bold text-ink">
              vs. {opponent.name}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-body-m">
              <span className={tierOf(opponent.tier).text}>{tierOf(opponent.tier).label}</span>
              <span className="text-ink-muted">· {opponent.region} · {opponent.record}</span>
            </div>

            <div className="mt-4">
              <HudLabel className="mb-2">Their recent form</HudLabel>
              <FormRow form={opponent.form} />
            </div>

            <div className="mt-6">
              <HudLabel className="mb-2">Starts in</HudLabel>
              <Countdown seconds={11 * 3600 + 24 * 60} />
            </div>

            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              <Button variant="primary" onClick={startMatch}>
                Ready check
                <ArrowRight />
              </Button>
              <Button onClick={() => navigate('/compete/diagnostics')}>Run diagnostics</Button>
            </div>
          </AngularPanel>
        </Reveal>
      </div>

      {/* Quick stats -------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { id: 'wr', label: 'Win rate', value: profile.winRate },
          { id: 'scrims', label: 'Scrims logged', value: profile.scrimsLogged },
          { id: 'rating', label: 'Rating', value: profile.rating },
          { id: 'hours', label: 'Hours this week', value: player.hoursThisWeek },
        ].map((stat, i) => (
          <Reveal key={stat.id} delay={i * 70}>
            <HudPanel interactive className="p-4">
              <HudLabel>{stat.label}</HudLabel>
              <div className="mt-2 font-display text-display-l font-bold text-ink">
                {stat.value}
              </div>
            </HudPanel>
          </Reveal>
        ))}
      </div>

      {/* Today + live ------------------------------------------------------- */}
      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <section>
          <HudSection
            eyebrow="Today"
            title="Your schedule"
            action={
              <Button variant="ghost" onClick={() => navigate('/prep/scrims')}>
                <Calendar />
                Full week
              </Button>
            }
          />
          <HudPanel className="divide-y divide-line p-2">
            {schedule.map((slot, i) => (
              <Reveal
                key={slot.id}
                delay={i * 70}
                className="flex items-center gap-4 px-3 py-3"
              >
                <span className="w-20 shrink-0 font-mono text-mono-m text-ink-muted">
                  {slot.time}
                </span>
                <span
                  aria-hidden="true"
                  className={`h-8 w-0.5 shrink-0 ${slot.highlight ? 'bg-ember' : 'bg-line'}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body-m text-ink">{slot.label}</div>
                  <div className="text-body-s text-ink-muted">{slot.kind}</div>
                </div>
                <Button variant="ghost" onClick={() => navigate(slot.to)} className="px-2 py-1">
                  Open
                </Button>
              </Reveal>
            ))}
          </HudPanel>
        </section>

        <section>
          <HudSection eyebrow="On air" title={`${active.short} right now`} />
          <Reveal>
            <HudPanel interactive glow="ember" className="scanlines overflow-hidden p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ember">
                  <LivePip />
                  <span className="hud-label text-ember">Live · {liveNow.kind}</span>
                </span>
                <span className="font-mono text-mono-m text-ink-muted">
                  {(liveNow.viewers / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate font-display text-display-m font-semibold text-ink">
                    {liveNow.sides[0]}
                  </div>
                  <div className="truncate font-display text-display-m font-semibold text-ink-muted">
                    {liveNow.sides[1]}
                  </div>
                </div>
                <div className="text-right font-mono text-mono-l text-ink">
                  <div>{liveNow.score[0]}</div>
                  <div className="text-ink-muted">{liveNow.score[1]}</div>
                </div>
              </div>
              <Button
                className="mt-5 w-full"
                onClick={() => navigate(`/compete/brackets/${active.id}`)}
              >
                <Broadcast />
                Watch feed
              </Button>
            </HudPanel>
          </Reveal>

          <Reveal delay={90}>
            <HudPanel className="mt-4 p-5">
              <HudLabel>Your ladder position</HudLabel>
              <div className="mt-3 flex items-baseline gap-3">
                <span className={`font-display text-display-xl font-bold ${t.text}`}>
                  #{ladder.length + 1}
                </span>
                <span className="text-body-m text-ink-muted">
                  in {profile.region} · {t.label}
                </span>
              </div>
              {/* The player's own row is listed, not just claimed above it. */}
              <ul className="mt-4 space-y-2 border-t border-line pt-3">
                {[
                  ...ladder.map((p, i) => ({
                    id: p.id,
                    rank: i + 1,
                    name: p.name,
                    rating: p.rating,
                    you: false,
                  })),
                  {
                    id: 'you',
                    rank: ladder.length + 1,
                    name: player.handle,
                    rating: profile.rating,
                    you: true,
                  },
                ].map((row) => (
                  <li
                    key={row.id}
                    className={`flex items-center gap-3 ${
                      row.you ? 'rounded-base bg-raised px-2 py-1' : ''
                    }`}
                  >
                    <span className="w-4 font-mono text-body-s text-ink-muted">{row.rank}</span>
                    <span
                      className={`min-w-0 flex-1 truncate text-body-m ${
                        row.you ? 'text-ink' : 'text-ink-muted'
                      }`}
                    >
                      {row.name}
                      {row.you && <span className="text-body-s text-signal"> · you</span>}
                    </span>
                    <span className="font-mono text-mono-m text-ink">{row.rating}</span>
                  </li>
                ))}
              </ul>
            </HudPanel>
          </Reveal>
        </section>
      </div>

      {/* Invites + VOD ------------------------------------------------------ */}
      <div className="grid gap-8 xl:grid-cols-2">
        <section>
          <HudSection
            eyebrow="Inbox"
            title={`Scrim invites (${invites.length})`}
            action={
              <Button variant="ghost" onClick={() => navigate('/prep/scrims')}>
                <Search />
                Find more
              </Button>
            }
          />
          <HudPanel className="divide-y divide-line p-2">
            {invites.map((invite, i) => {
              const it = tierOf(invite.tier)
              return (
                <Reveal
                  key={invite.id}
                  delay={i * 70}
                  className="flex flex-wrap items-center gap-3 px-3 py-3"
                >
                  <span aria-hidden="true" className={`h-8 w-0.5 shrink-0 ${it.bg}`} />
                  <div className="min-w-32 flex-1">
                    <div className="text-body-m text-ink">{invite.team}</div>
                    <div className="text-body-s">
                      <span className={it.text}>{it.label}</span>
                      <span className="text-ink-muted"> · starts {invite.time}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button onClick={() => dismiss(invite.id)}>Accept</Button>
                    <Button variant="ghost" onClick={() => dismiss(invite.id)}>
                      Pass
                    </Button>
                  </div>
                </Reveal>
              )
            })}
            {invites.length === 0 && (
              <p className="px-3 py-8 text-center text-body-m text-ink-muted">
                Inbox clear. Open the scrim finder to send requests.
              </p>
            )}
          </HudPanel>
        </section>

        <section>
          <HudSection
            eyebrow="Review"
            title="Recent VOD notes"
            action={
              <Button variant="ghost" onClick={() => navigate('/prep/vod')}>
                <Film />
                Open review
              </Button>
            }
          />
          <div className="grid gap-3">
            {vodNotes.map((note, i) => (
              <Reveal key={note.id} delay={i * 70}>
                <HudPanel interactive corners={false} className="flex items-center gap-4 p-4">
                  <Play className="shrink-0 text-signal" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-body-m text-ink">{note.note}</div>
                    <div className="text-body-s text-ink-muted">
                      {active.unit} {note.map.replace(/^Map /, '')}
                    </div>
                  </div>
                  <span className="font-mono text-mono-m text-ink-muted">{note.tags} tags</span>
                </HudPanel>
              </Reveal>
            ))}

            <Reveal delay={140}>
              <HudPanel className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="text-ember" />
                  <HudLabel>Sleep this week</HudLabel>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  {wellness.week.map((day, i) => (
                    <div key={day.day} className="flex flex-1 flex-col items-center gap-1.5">
                      <div
                        className="animate-bar-y w-full rounded-sm bg-signal/60"
                        style={{
                          // Scaled from 5h, not from zero: a 0-10 axis makes
                          // 6.2h and 8.1h look like the same night.
                          height: `${Math.max(6, ((day.sleep - 5) / 4) * 64)}px`,
                          animationDelay: `${200 + i * 60}ms`,
                        }}
                        title={`${day.day}: ${day.sleep}h`}
                      />
                      <span className="text-body-s text-ink-muted">{day.day[0]}</span>
                    </div>
                  ))}
                </div>
              </HudPanel>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  )
}
