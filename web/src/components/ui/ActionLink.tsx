import type { ReactNode } from 'react'
import { ArrowIcon } from './icons'

/** Link externo com seta que "escapa" na diagonal no hover. */
export function ExternalAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group label-mono inline-flex items-center gap-2 text-ink-muted transition-colors duration-(--duration-quick) ease-out-quart hover:text-ink"
    >
      <span className="relative pb-0.5 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-(--duration-base) after:ease-out-expo group-hover:after:scale-x-100">
        {children}
      </span>
      <ArrowIcon
        direction="up-right"
        className="transition-transform duration-(--duration-base) ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  )
}
