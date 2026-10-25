import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cn } from '@/lib/cn'

/*
 * Botão principal: retângulo de traço fino; no hover, uma lâmina âmbar
 * sobe por baixo do texto (scaleY), sem mudar layout.
 */
const buttonClass =
  'group/btn relative isolate inline-flex h-11 items-center gap-3 overflow-hidden border border-ink-faint px-5 label-mono text-ink transition-[color,border-color] duration-(--duration-base) ease-out-quart hover:border-amber hover:text-void active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40'

function Fill() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 -z-1 origin-bottom scale-y-0 bg-amber transition-transform duration-(--duration-base) ease-out-expo group-hover/btn:scale-y-100"
    />
  )
}

export function Button({ className, children, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cn(buttonClass, className)} {...props}>
      <Fill />
      {children}
    </button>
  )
}

export function ButtonLink({ className, children, ...props }: LinkProps) {
  return (
    <Link className={cn(buttonClass, className)} viewTransition {...props}>
      <Fill />
      {children}
    </Link>
  )
}
