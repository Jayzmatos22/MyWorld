export function Footer() {
  return (
    <footer className="mt-section border-t border-rule/70">
      <div className="page-grid gap-y-6 py-10 text-meta text-ink-muted">
        <p className="col-span-full font-display text-title text-ink md:col-span-5">
          Uma placa por dia, <em className="text-ink-muted">desde 16 de junho de 1995.</em>
        </p>
        <dl className="label-mono col-span-full grid grid-cols-2 gap-x-6 gap-y-3 md:col-span-6 md:col-start-7">
          <div>
            <dt className="text-ink-faint">Fonte</dt>
            <dd>
              <a
                className="underline decoration-rule underline-offset-4 transition-colors hover:text-amber hover:decoration-amber"
                href="https://apod.nasa.gov/apod/astropix.html"
                target="_blank"
                rel="noreferrer"
              >
                NASA · APOD
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Direitos</dt>
            <dd>Dos autores de cada placa</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Teclado</dt>
            <dd>← → navegam entre dias</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Construído com</dt>
            <dd>React · TypeScript · Tailwind</dd>
          </div>
        </dl>
      </div>
    </footer>
  )
}
