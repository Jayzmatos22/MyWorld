import { createElement, type HTMLAttributes } from 'react'
import { useReveal } from '@/hooks/useReveal'
import type { StyleWithVars } from '@/lib/css'

type RevealTag = 'div' | 'section' | 'li' | 'header' | 'aside' | 'figure' | 'article' | 'p' | 'dl' | 'nav' | 'ol'

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: RevealTag
  /** Posição na coreografia: atraso = index × --stagger-step */
  index?: number
  variant?: 'rise' | 'fade'
}

export function Reveal({ as = 'div', index = 0, variant = 'rise', style, ...rest }: RevealProps) {
  const ref = useReveal()
  const vars: StyleWithVars = { '--reveal-i': index, ...style }
  return createElement(as, {
    ...rest,
    ref,
    style: vars,
    'data-reveal': variant === 'fade' ? 'fade' : '',
  })
}
