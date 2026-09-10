import AngularPanel from './AngularPanel'
import GameTile from './GameTile'
import RankBadge from './RankBadge'
import { Button } from './ui'
import { HudLabel, HudPanel } from './hud'
import { DnaStrip } from './DnaDimensions'
import { ConfidenceMeter } from './CompetitiveIdentity'
import { InsightBullet } from './InsightCard'
import { Play } from './icons'
import { tier as tierOf } from '../tiers'
import { GAMES_BY_ID, genreOf } from '../data/games'

/**
 * The passport card - the unit an organisation actually reads.
 *
 * The previous product's version of this card led with "Diamond · 2410", and
 * that ordering was the whole problem: a rank ranks a player against everyone
 * and describes them to nobody. Here the identity the model composed leads,
 * the three traits behind it sit under it, the Competitive DNA strip gives the
 * shape, and rank has been demoted to one chip among the supporting numbers.
 *
 * It renders one `profile` - a title the player competes in - so role, tier
 * and headline stats come from that title's own vocabulary rather than from a
 * fixed set of Valorant fields.
 */
export default function PlayerCard({
  player,
  profile,
  dna,
  highlights = [],
  orgActions = false,
  trajectory,
  extraStats = [],
}) {
  const game = GAMES_BY_ID[profile.gameId]
  const t = tierOf(profile.tier)

  return (
    <HudPanel className="p-6">
      <div className="flex flex-wrap gap-6">
        {/* The angular photo frame, carrying the tier colour. */}
        <AngularPanel
          accent={profile.tier}
          fill="bg-raised"
          className="h-40 w-40 shrink-0"
          innerClassName="flex items-center justify-center"
        >
          <span className={`font-display text-display-xl font-bold ${t.text}`}>
            {player.initials}
          </span>
        </AngularPanel>

        <div className="min-w-56 flex-1">
          <h2 className="font-display text-display-l font-bold text-ink">{player.fullName}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-body-m text-ink-muted">
            <GameTile game={game} size="s" />
            {profile.role} · {game.name}
            <span className={genreOf(game).text}>{genreOf(game).label}</span>
          </p>

          {dna && (
            <>
              <div className="mt-4">
                <HudLabel className="text-signal">Competitive identity</HudLabel>
                <div className="mt-1 font-display text-display-l font-bold text-ink">
                  {dna.identity}
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {dna.traits.map((trait) => (
                  <InsightBullet key={trait} tone="edge">
                    {trait}
                  </InsightBullet>
                ))}
              </ul>
            </>
          )}

          {/* Rank, deliberately below the identity rather than above it. */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <RankBadge tier={profile.tier} size="s" />
            <span className="font-mono text-mono-m text-ink-muted">
              {profile.rating} rating · {profile.region}
            </span>
            {trajectory && (
              <span
                className={`text-body-s ${
                  trajectory.tone === 'edge'
                    ? 'text-edge'
                    : trajectory.tone === 'ember'
                      ? 'text-ember'
                      : 'text-ink-muted'
                }`}
              >
                {trajectory.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {dna && (
        <div className="mt-6 border-t border-line pt-6">
          <HudLabel className="mb-3">Competitive DNA</HudLabel>
          <DnaStrip dna={dna} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Win rate', value: profile.winRate },
          { label: 'Matches analysed', value: profile.matchesAnalyzed },
          // Headline stats are whatever this scene actually quotes.
          ...profile.stats,
          // Dropped rather than shown as an em dash when it is not known. A
          // passport for a player found through the Network has no
          // availability on it, and a blank tile claims the field exists and
          // is empty rather than that it was never collected.
          profile.availability ? { label: 'Availability', value: profile.availability } : null,
          ...extraStats,
        ]
          .filter(Boolean)
          .map((stat) => (
          <div key={stat.label} className="rounded-base border border-line bg-raised/60 p-3">
            <HudLabel>{stat.label}</HudLabel>
            <div className="mt-1.5 font-mono text-mono-m text-ink">{stat.value}</div>
          </div>
        ))}
      </div>

      {dna && <ConfidenceMeter dna={dna} className="mt-6" />}

      {highlights.length > 0 && (
        <div className="mt-6 border-t border-line pt-6">
          <HudLabel className="text-signal">Notable performances ({highlights.length})</HudLabel>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {highlights.map((clip) => (
              <li key={clip.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-base border border-line bg-raised px-3 py-2 text-left transition-colors duration-100 hover:bg-line"
                >
                  <Play className="shrink-0 text-signal" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-m text-ink">{clip.label}</span>
                    {clip.dimension && (
                      <span className="block truncate text-body-s text-ink-muted">
                        Cited for {clip.dimension}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-mono-m text-ink-muted">{clip.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {orgActions && (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
          <Button variant="primary">Message {player.handle}</Button>
          <Button>Invite to tryout</Button>
        </div>
      )}
    </HudPanel>
  )
}

/** Switches which of the player's titles the passport is showing. */
export function ProfileTabs({ player, activeGameId, onSelect }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {player.profiles.map((profile) => {
        const game = GAMES_BY_ID[profile.gameId]
        const active = profile.gameId === activeGameId
        return (
          <button
            key={profile.gameId}
            type="button"
            onClick={() => onSelect(profile.gameId)}
            className={`flex items-center gap-2 rounded-base border px-3 py-2 text-body-m transition-colors duration-100 ${
              active
                ? 'border-signal/70 bg-raised text-ink'
                : 'border-line bg-surface/60 text-ink-muted hover:text-ink'
            }`}
          >
            <GameTile game={game} size="s" />
            <span className="hidden sm:inline">{game.name}</span>
            <span className="sm:hidden">{game.short}</span>
            <span className="font-mono text-body-s text-ink-muted">{profile.role}</span>
          </button>
        )
      })}
    </div>
  )
}
