import type { CSSProperties } from 'react'

/** Permite custom properties (--x) em `style` sem perder a tipagem. */
export type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>
