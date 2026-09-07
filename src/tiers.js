// The rank-tier ramp is one shared system across every module: the same tier
// renders the same color on a leaderboard, a scrim row and a profile border
// (spec §3). Tier is always conveyed by color *and* label, never color alone.
// Class strings are written out in full because Tailwind cannot see
// dynamically composed class names.
export const TIERS = {
  bronze: { label: 'Bronze', text: 'text-bronze', bg: 'bg-bronze', border: 'border-bronze' },
  silver: { label: 'Silver', text: 'text-silver', bg: 'bg-silver', border: 'border-silver' },
  gold: { label: 'Gold', text: 'text-gold', bg: 'bg-gold', border: 'border-gold' },
  platinum: {
    label: 'Platinum',
    text: 'text-platinum',
    bg: 'bg-platinum',
    border: 'border-platinum',
  },
  diamond: { label: 'Diamond', text: 'text-diamond', bg: 'bg-diamond', border: 'border-diamond' },
}

export const tier = (key) => TIERS[key] ?? TIERS.bronze
