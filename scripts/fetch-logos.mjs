#!/usr/bin/env node
/**
 * Vendors game logos into src/assets/logos/, named by game id.
 *
 * Source is Simple Icons (https://simpleicons.org), whose icon files are
 * CC0 1.0. The marks themselves remain the trademarks of their owners; they
 * are used here to identify the games the platform actually covers.
 *
 * Only titles with a `logoSlug` in src/data/games.js are fetched. Everything
 * else keeps its monogram tile until a file is added by hand - see the README
 * in src/assets/logos/.
 *
 * Re-runnable: existing files are skipped unless --force is passed.
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'src/assets/logos')
const force = process.argv.includes('--force')

// games.js is ESM with no dependencies at module scope, so it imports directly.
const { GAMES } = await import(resolve(root, 'src/data/games.js'))

const exists = (p) => access(p).then(() => true, () => false)

await mkdir(outDir, { recursive: true })

const withSlug = GAMES.filter((g) => g.logoSlug)
let fetched = 0
let skipped = 0
const failed = []

for (const game of withSlug) {
  const out = resolve(outDir, `${game.id}.svg`)
  if (!force && (await exists(out))) {
    skipped += 1
    continue
  }
  // One-colour white: Simple Icons serves each mark in its brand colour, and
  // several of those (Fortnite's is near-black) vanish against this UI. A
  // single-colour rendition is the form publishers ship for dark backgrounds.
  const url = `https://cdn.simpleicons.org/${game.logoSlug}/white`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const svg = await res.text()
    if (!svg.trimStart().startsWith('<svg')) throw new Error('not an SVG')
    await writeFile(out, svg)
    fetched += 1
    console.log(`  fetched  ${game.id}.svg  (${game.name})`)
  } catch (err) {
    failed.push(`${game.id} (${game.logoSlug}): ${err.message}`)
  }
}

const missing = GAMES.filter((g) => !g.logoSlug)

console.log(`\n${fetched} fetched, ${skipped} already present.`)
if (failed.length) console.log(`\nFailed:\n  ${failed.join('\n  ')}`)
if (missing.length) {
  console.log(
    `\n${missing.length} titles have no vendored mark and render a monogram tile:\n  ` +
      missing.map((g) => `${g.id.padEnd(14)} ${g.name}`).join('\n  ') +
      `\n\nDrop a file at src/assets/logos/<id>.svg|png|webp to use a real logo.`,
  )
}
