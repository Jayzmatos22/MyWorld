import { createBrowserRouter } from 'react-router'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <main className="page-grid min-h-svh content-center">
        <h1 className="col-span-full text-display">myPlanet</h1>
        <p className="label-mono col-span-full text-ink-muted">Arquivo de placas — em construção</p>
      </main>
    ),
  },
])
