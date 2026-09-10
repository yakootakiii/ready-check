/**
 * Renders every route through Vite's SSR pipeline.
 *
 * The production build is not a safety net: Vite does no type or reference
 * checking, so a deleted constant or a renamed component builds green and
 * throws in the browser. This actually executes every screen and fails loudly
 * if one of them cannot render.
 *
 * It does not replace loading the app. Effects and event handlers never run
 * during `renderToString`, so a handler referencing an undefined binding still
 * gets through - check the console in a real browser before calling a change
 * done.
 *
 *   npm run smoke
 */
import { createServer } from 'vite'

const ROUTES = [
  '/',
  '/analyze',
  '/analyze/matches',
  '/analyze/trends',
  '/analyze/vod',
  '/analyze/condition',
  '/matchup',
  '/matchup/opponents',
  '/matchup/opponents/valorant-t1',
  '/compete/matches',
  '/compete/tournaments',
  '/compete/tournaments/mlbb',
  '/compete/tournaments/mlbb/mlbb-e0',
  // A solo title's draw comes from the player pool, so the path panel has to
  // render nothing rather than crash looking for a roster in it.
  '/compete/tournaments/sf6/sf6-e0',
  '/compete/scrims',
  '/compete/setup',
  '/network',
  '/network/teams',
  '/network/teams/valorant-t0',
  '/network/schools',
  '/network/orgs',
  '/network/talent',
  '/passport',
  '/passport/valorant-p3',
]

/**
 * Strings that mean something rendered wrong rather than merely looked odd. A
 * peso check is included because the setting is the Philippines and a dollar
 * sign is a bug, not a preference.
 */
const SMELLS = [
  ['undefined in output', /undefined/],
  ['NaN in output', /NaN/],
  ['[object Object]', /\[object Object\]/],
  ['stale "Ready Check" naming', /Ready\s?Check/i],
  ['dollar-denominated prize', /\$\d/],
]

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

// The entry lives inside the project so App and React Router come from one
// module graph — importing the router separately yields two instances and an
// empty router context.
const { render } = await server.ssrLoadModule('/scripts/ssr-entry.jsx')

let failures = 0

for (const route of ROUTES) {
  let html
  try {
    html = render(route)
  } catch (error) {
    failures += 1
    console.log(`FAIL  ${route}\n      ${error.message.split('\n')[0]}`)
    if (process.env.TRACE) console.log(error.stack.split('\n').slice(1, 6).join('\n'))
    continue
  }

  // A route that renders almost nothing has usually matched the catch-all
  // redirect rather than the screen it was meant to.
  if (html.length < 4000) {
    failures += 1
    console.log(`THIN  ${route}  (${html.length} bytes — did it fall through to the redirect?)`)
    continue
  }

  const text = html.replace(/<[^>]+>/g, ' ')
  const found = SMELLS.filter(([, pattern]) => pattern.test(text)).map(([label]) => label)
  if (found.length) {
    failures += 1
    console.log(`SMELL ${route}  ${found.join(', ')}`)
  } else {
    console.log(`ok    ${route}  (${(html.length / 1024).toFixed(1)} kB)`)
  }
}

await server.close()
console.log(failures ? `\n${failures} route(s) failed` : `\nAll ${ROUTES.length} routes rendered clean`)
process.exit(failures ? 1 : 0)
