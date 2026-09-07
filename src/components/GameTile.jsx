import { genreOf, monogram } from '../data/games'

/**
 * A title's mark.
 *
 * Real logos live in src/assets/logos/ named by game id and are picked up
 * here at build time — dropping a file in is the only step, no manifest and no
 * code change. Titles with no file fall back to a monogram in the same clipped,
 * genre-tinted frame, so a grid with partial logo coverage still reads as one
 * set rather than two.
 *
 * Logos are the trademarks of their publishers and are used to identify the
 * games the platform covers; see the README beside the files.
 */
const LOGOS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/logos/*.{svg,png,webp,jpg}', {
      eager: true,
      query: '?url',
      import: 'default',
    }),
  ).map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url]),
)

// Logos are inset a little more than a centred mark needs, because the frame's
// clipped corner would otherwise bite into the artwork.
const SIZES = {
  s: { box: 'h-7 w-7', type: 'text-body-s', pad: 'p-1.5' },
  m: { box: 'h-10 w-10', type: 'text-body-m', pad: 'p-2' },
  l: { box: 'h-14 w-14', type: 'text-display-m', pad: 'p-3' },
}

const CLIP = 'polygon(22% 0, 100% 0, 100% 78%, 78% 100%, 0 100%, 0 22%)'

export default function GameTile({ game, size = 'm', className = '' }) {
  const genre = genreOf(game)
  const dims = SIZES[size] ?? SIZES.m
  const logo = LOGOS[game.id]

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center border ${genre.text} ${genre.border} ${dims.box} ${className}`}
      style={{
        clipPath: CLIP,
        backgroundColor: 'color-mix(in oklab, currentColor 14%, transparent)',
      }}
    >
      {logo ? (
        <img
          src={logo}
          alt=""
          loading="lazy"
          className={`h-full w-full object-contain ${dims.pad}`}
        />
      ) : (
        <span className={`font-display font-bold ${dims.type}`}>{monogram(game)}</span>
      )}
    </span>
  )
}
