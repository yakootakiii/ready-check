import { HudLabel } from './hud'
import { InsightBullet } from './InsightCard'
import { Check } from './icons'

/**
 * What a competitor *is*, in place of what rank they hold.
 *
 * The old product's profile led with "Diamond · 2410". That tells an org
 * nothing it could act on: it ranks the player against everyone and describes
 * them to no one. This block leads with the identity the model composed from
 * their Competitive DNA, then the three traits that produced it, and puts rank
 * where it belongs - as a supporting number further down the page.
 *
 * Confidence is shown next to it deliberately. An identity asserted without a
 * sample size is a horoscope; with one, it is a claim a recruiter can weigh.
 */
export default function CompetitiveIdentity({ dna, size = 'm', showWeakness = false, className = '' }) {
  const large = size === 'l'

  return (
    <div className={className}>
      <HudLabel className="text-signal">Competitive identity</HudLabel>
      <div
        className={`mt-1.5 font-display font-bold leading-tight text-ink ${
          large ? 'text-display-xl' : 'text-display-l'
        }`}
      >
        {dna.identity}
      </div>

      <ul className="mt-4 space-y-2">
        {dna.traits.map((trait) => (
          <InsightBullet key={trait} tone="edge">
            {trait}
          </InsightBullet>
        ))}
        {showWeakness &&
          dna.weaknesses.map((weakness) => (
            <InsightBullet key={weakness} tone="ember">
              {weakness}
            </InsightBullet>
          ))}
      </ul>

      <ConfidenceMeter dna={dna} className="mt-5" />
    </div>
  )
}

/**
 * How much the model is willing to stand behind this profile, and why.
 *
 * Reported from sample size and the title's coverage level rather than
 * asserted, so a title the engine is still calibrating on cannot present
 * itself as settled.
 */
export function ConfidenceMeter({ dna, className = '' }) {
  const tone = dna.confidence >= 80 ? 'bg-edge' : dna.confidence >= 62 ? 'bg-signal' : 'bg-ember'
  const textTone =
    dna.confidence >= 80 ? 'text-edge' : dna.confidence >= 62 ? 'text-signal' : 'text-ember'

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <HudLabel>Model confidence</HudLabel>
        <span className={`font-mono text-mono-m ${textTone}`}>{dna.confidence}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-raised">
        <div
          className={`animate-bar h-full rounded-full ${tone}`}
          style={{ width: `${dna.confidence}%`, animationDelay: '260ms' }}
        />
      </div>
      <p className="mt-2 text-body-s text-ink-muted">
        Built from {dna.sample} analysed {dna.sample === 1 ? 'match' : 'matches'} on{' '}
        {dna.game.name}.
      </p>
    </div>
  )
}

/** A verified-record chip, for achievements a result was actually checked against. */
export function VerifiedChip({ verified, className = '' }) {
  return verified ? (
    <span className={`inline-flex items-center gap-1.5 text-body-s text-edge ${className}`}>
      <Check />
      Verified
    </span>
  ) : (
    <span className={`inline-flex items-center gap-1.5 text-body-s text-ink-muted ${className}`}>
      Self-reported
    </span>
  )
}
