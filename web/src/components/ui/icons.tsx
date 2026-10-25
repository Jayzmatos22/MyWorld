import type { SVGProps } from 'react'

/* Ícones em traço fino, desenhados para o projeto (sem emojis, sem bibliotecas). */

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'square',
  'aria-hidden': true,
  focusable: false,
} as const

export function ArrowIcon({ direction = 'right', ...props }: IconProps & { direction?: 'left' | 'right' | 'up-right' }) {
  const rotate = { right: 0, left: 180, 'up-right': -45 }[direction]
  return (
    <svg {...base} {...props} style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  )
}

/** Estrela de quatro pontas, como um ponto de difração de telescópio. */
export function StarIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M8 1.5c.5 3.6 2.9 6 6.5 6.5-3.6.5-6 2.9-6.5 6.5-.5-3.6-2.9-6-6.5-6.5 3.6-.5 6-2.9 6.5-6.5Z" strokeLinejoin="round" />
    </svg>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 2.5v11l9-5.5-9-5.5Z" strokeLinejoin="round" />
    </svg>
  )
}

export function DiceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="2" width="12" height="12" />
      <path d="M5 5h.01M11 11h.01M8 8h.01" strokeWidth={2.2} />
    </svg>
  )
}
