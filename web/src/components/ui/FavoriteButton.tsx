import { useState } from 'react'
import type { Apod } from '@/api/types'
import { useIsFavorite } from '@/hooks/useFavorites'
import { favoritesStore } from '@/lib/favorites'
import { cn } from '@/lib/cn'
import type { StyleWithVars } from '@/lib/css'
import { StarIcon } from './icons'

const SPARK_ANGLES = [0, 60, 120, 180, 240, 300]

export function FavoriteButton({ apod, className }: { apod: Apod; className?: string }) {
  const active = useIsFavorite(apod.date)
  // Trocar a chave remonta os elementos e reinicia a animação CSS
  const [burst, setBurst] = useState(0)

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => {
        if (favoritesStore.toggle(apod)) setBurst((n) => n + 1)
      }}
      className={cn(
        'group label-mono inline-flex items-center gap-3 transition-colors duration-(--duration-quick) ease-out-quart',
        active ? 'text-amber' : 'text-ink-muted hover:text-ink',
        className,
      )}
    >
      <span
        className={cn(
          'relative grid size-10 place-items-center border transition-[border-color,transform] duration-(--duration-base) ease-spring group-active:scale-90',
          active ? 'border-amber/70' : 'border-rule group-hover:border-ink-faint',
        )}
      >
        <StarIcon key={`star-${burst}`} filled={active} className={cn('size-4', burst > 0 && active && 'fav-star-pop')} />
        {burst > 0 && active ? (
          <span key={`burst-${burst}`} aria-hidden="true">
            {SPARK_ANGLES.map((a) => (
              <span key={a} className="fav-spark" style={{ '--a': `${a}deg` } as StyleWithVars} />
            ))}
          </span>
        ) : null}
      </span>
      <span>{active ? 'Nos favoritos' : 'Favoritar'}</span>
    </button>
  )
}
