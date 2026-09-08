// SSR entry for `npm run smoke`. Kept inside the project so Vite resolves App
// and React Router from the same module graph the app itself uses.
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'

export function render(route) {
  return renderToString(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}
