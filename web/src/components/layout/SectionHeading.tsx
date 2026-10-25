import type { ReactNode } from 'react'
import { Reveal } from '@/components/ui/Reveal'
import { SplitTitle } from '@/components/ui/SplitTitle'

interface SectionHeadingProps {
  kicker: string
  title: string
  as?: 'h1' | 'h2'
  children?: ReactNode
  aside?: ReactNode
}

/** Abertura de seção: rótulo mono, título display e um texto lateral. */
export function SectionHeading({ kicker, title, as = 'h1', children, aside }: SectionHeadingProps) {
  return (
    <header className="page-grid gap-y-6 pt-10 pb-12 md:pt-16 md:pb-20">
      <Reveal index={0} className="col-span-full md:col-span-3">
        <p className="label-mono text-amber">{kicker}</p>
      </Reveal>
      <div className="col-span-full md:col-span-9">
        <SplitTitle as={as} text={title} className="text-display" />
        {children ? (
          <Reveal index={2} className="mt-6 max-w-(--container-measure) text-lede text-ink-muted">
            {children}
          </Reveal>
        ) : null}
      </div>
      {aside ? (
        <Reveal index={3} className="col-span-full md:col-span-9 md:col-start-4">
          {aside}
        </Reveal>
      ) : null}
    </header>
  )
}
