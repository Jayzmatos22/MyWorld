import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'empty' | 'error' | 'limit'

/** Retículo de telescópio desenhado em traço fino; muda com o tipo de estado. */
function Reticle({ variant }: { variant: Variant }) {
  return (
    <svg viewBox="0 0 120 120" className="size-28 text-ink-faint md:size-36" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="60" cy="60" r="52" strokeWidth="0.75" strokeDasharray={variant === 'empty' ? '2 5' : undefined} />
      <circle cx="60" cy="60" r="30" strokeWidth="0.75" />
      <path d="M60 0v22M60 98v22M0 60h22M98 60h22" strokeWidth="0.75" />
      {variant === 'error' ? <path d="M45 45l30 30M75 45L45 75" strokeWidth="1" className="text-signal-red" stroke="currentColor" /> : null}
      {variant === 'limit' ? (
        <path d="M60 8a52 52 0 0 1 45 26" strokeWidth="2" className="text-amber" stroke="currentColor" />
      ) : null}
      {variant === 'empty' ? <circle cx="60" cy="60" r="1.5" fill="currentColor" className="text-amber" /> : null}
    </svg>
  )
}

interface StatusPanelProps {
  variant: Variant
  code: string
  title: string
  children: ReactNode
  actions?: ReactNode
  className?: string | undefined
}

export function StatusPanel({ variant, code, title, children, actions, className }: StatusPanelProps) {
  return (
    <section
      role={variant === 'empty' ? undefined : 'alert'}
      className={cn('page-grid items-center gap-y-8 py-section', className)}
    >
      <div className="col-span-full md:col-span-3 md:col-start-2">
        <Reticle variant={variant} />
      </div>
      <div className="col-span-full md:col-span-6 md:col-start-6">
        <p className={cn('label-mono', variant === 'empty' ? 'text-ink-muted' : variant === 'limit' ? 'text-amber' : 'text-signal-red')}>
          {code}
        </p>
        <h2 className="mt-4 text-headline italic">{title}</h2>
        <div className="mt-6 max-w-(--container-measure) text-lede text-ink-muted">{children}</div>
        {actions ? <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">{actions}</div> : null}
      </div>
    </section>
  )
}
