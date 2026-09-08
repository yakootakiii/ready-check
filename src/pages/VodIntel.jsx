import { useState } from 'react'
import AngularPanel from '../components/AngularPanel'
import GameTile from '../components/GameTile'
import VodTimeline from '../components/VodTimeline'
import Reveal from '../components/Reveal'
import CoverageNote from '../components/CoverageNote'
import { HudLabel, HudPageHeader, HudPanel, HudSection } from '../components/hud'
import { Button } from '../components/ui'
import { Film, Pause, Play, Plus, Sparkle } from '../components/icons'
import { formatClock } from '../format'
import { player, vod } from '../data/mock'
import { useGame } from '../gameContext'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { dimensionOf } from '../data/dna'
import { recentMatchesFor } from '../data/matchup'

/**
 * VOD intelligence.
 *
 * The honest version of "AI VOD analysis": the model proposes markers, the
 * player confirms or adds their own, and the two are visibly different on the
 * timeline. Each model marker also says which Competitive DNA dimension it is
 * evidence for, which is what connects a moment in a recording to the profile
 * that gets built out of it - a tagging tool that produced tags and nothing
 * else would be a notepad with timestamps.
 */
export default function VodIntel() {
  const { game } = useGame()
  const active = game ?? GAMES_BY_ID[player.primaryGameId]
  const lastMatch = recentMatchesFor(active.id)[0]
  const title = `${lastMatch.matchup.mine.name} vs. ${lastMatch.opponent.name} — ${active.unit} 2`

  const [position, setPosition] = useState(vod.positionSeconds)
  const [playing, setPlaying] = useState(false)
  const [tags, setTags] = useState(vod.tags)
  const [draft, setDraft] = useState('')

  const addTag = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    setTags((list) =>
      [
        ...list,
        { id: `t${Date.now()}`, at: position, label: draft.trim(), source: 'you', dimension: null },
      ].sort((a, b) => a.at - b.at),
    )
    setDraft('')
  }

  const flagged = tags.filter((tag) => tag.source === 'model')

  return (
    <div>
      <HudPageHeader
        eyebrow="VOD intelligence"
        title="Review"
        subtitle={`${title} · recorded ${vod.recorded}`}
        action={
          <span className="flex items-center gap-2 rounded-base border border-line bg-surface/85 px-3 py-2 text-body-m text-ink-muted">
            <GameTile game={active} size="s" />
            {flagged.length} model flags · {tags.length - flagged.length} yours
          </span>
        }
      />

      <CoverageNote game={active} className="mb-4" />

      <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        {/* Two reveals, not one wrapping the other: nesting them would stack
            two entrance animations on the same content. */}
        <div>
          <Reveal>
          <AngularPanel accent="signal" fill="bg-surface/85" innerClassName="overflow-hidden">
            {/* The stage stays plain - the value is in the analysis layer, not
                in custom video chrome. */}
            <div className="scanlines relative flex aspect-video items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3 text-center">
                <Film className="h-7 w-7 text-signal" />
                <span className="font-display text-display-m font-semibold text-ink">{title}</span>
                <span className="text-body-s text-ink-muted">{active.unit} footage</span>
              </div>
              <div className="absolute left-4 top-4 rounded-base border border-line bg-base/70 px-2.5 py-1">
                <span className="hud-label text-ink-muted">Review</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-2">
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                aria-label={playing ? 'Pause' : 'Play'}
                className="rounded-base p-2 text-ink transition-colors duration-100 hover:bg-raised"
              >
                {playing ? <Pause /> : <Play />}
              </button>
              <span className="font-mono text-mono-m text-ink-muted">
                {formatClock(position)} / {vod.durationLabel}
              </span>
              <span className="ml-auto flex flex-wrap items-center gap-x-4 text-body-s text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-signal" />
                  Model flagged
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-ember" />
                  Yours
                </span>
              </span>
            </div>

            <VodTimeline
              duration={vod.durationSeconds}
              position={position}
              tags={tags}
              onSeek={setPosition}
            />
          </AngularPanel>
          </Reveal>

          {/* What these moments feed --------------------------------------- */}
          <Reveal delay={120} className="mt-4">
            <HudPanel className="p-5">
              <HudLabel className="text-signal">What the model took from this VOD</HudLabel>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {flagged.map((tag) => {
                  const dimension = tag.dimension ? dimensionOf('player', tag.dimension) : null
                  return (
                    <li key={tag.id} className="rounded-base border border-line bg-raised/50 p-3">
                      <div className="font-mono text-mono-m text-signal">
                        {formatClock(tag.at)}
                      </div>
                      <div className="mt-1 text-body-m text-ink">{tag.label}</div>
                      {dimension && (
                        <div className="mt-2 border-t border-line pt-2 text-body-s text-ink-muted">
                          Evidence for <span className="text-ink">{dimension.label}</span>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-body-s text-ink-muted">
                <Sparkle className="mt-0.5 shrink-0" />
                Flags are proposals. Confirming or overriding one is what actually moves the
                dimension it is filed under — the model does not get to grade itself.
              </p>
            </HudPanel>
          </Reveal>
        </div>

        <Reveal delay={90}>
          <HudPanel className="flex h-full flex-col p-4">
            <HudSection eyebrow="Markers" title="On this VOD" />

            <ul className="flex-1 divide-y divide-line">
              {tags.map((tag) => {
                const current = Math.abs(tag.at - position) < 3
                const fromModel = tag.source === 'model'
                const dimension = tag.dimension ? dimensionOf('player', tag.dimension) : null
                return (
                  <li key={tag.id}>
                    <button
                      type="button"
                      onClick={() => setPosition(tag.at)}
                      className="flex w-full items-start gap-3 py-2.5 text-left transition-colors duration-100 hover:text-signal"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-1 h-4 w-0.5 shrink-0 ${
                          current ? 'bg-ink' : fromModel ? 'bg-signal' : 'bg-ember/70'
                        }`}
                      />
                      <span className="font-mono text-mono-m text-ink-muted">
                        {formatClock(tag.at)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-body-m ${current ? 'text-signal' : 'text-ink'}`}>
                          {tag.label}
                        </span>
                        <span className="block text-body-s text-ink-muted">
                          {fromModel ? 'Model flagged' : 'Your note'}
                          {dimension ? ` · ${dimension.label}` : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <form onSubmit={addTag} className="mt-4 border-t border-line pt-4">
              <HudLabel>Note at {formatClock(position)}</HudLabel>
              <input
                id="tag-note"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What happened here?"
                className="mt-2 w-full rounded-base border border-line bg-raised px-3 py-2 text-body-m text-ink placeholder:text-ink-muted"
              />
              <Button variant="primary" className="mt-3 w-full" onClick={addTag}>
                <Plus />
                Add marker at {formatClock(position)}
              </Button>
            </form>
          </HudPanel>
        </Reveal>
      </div>

      <p className="mt-6 text-body-s text-ink-muted">
        {genreOf(active).label} · Markers from this review feed the {active.short} Competitive
        DNA profile the next time it is rebuilt.
      </p>
    </div>
  )
}
