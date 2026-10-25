import { createElement, Fragment } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'
import type { StyleWithVars } from '@/lib/css'

interface SplitTitleProps {
  text: string
  as?: 'h1' | 'h2'
  className?: string
  style?: StyleWithVars
}

/**
 * Título que sobe palavra por palavra de dentro de uma fenda (overflow: clip).
 * Leitores de tela recebem o texto inteiro; os fragmentos ficam ocultos.
 */
export function SplitTitle({ text, as = 'h1', className, style }: SplitTitleProps) {
  const ref = useReveal()
  const words = text.split(/\s+/).filter(Boolean)

  return createElement(
    as,
    { ref, className: cn('split-title', className), style },
    <span className="sr-only">{text}</span>,
    <span aria-hidden="true">
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="split-word">
            <span style={{ '--word-i': i } as StyleWithVars}>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>,
  )
}
