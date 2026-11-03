import { useState } from 'react'
import type { ApiError } from '@/api/errors'
import type { IsoDate } from '@/api/types'
import { useLike } from '@/hooks/useLikes'
import { cn } from '@/lib/cn'
import type { StyleWithVars } from '@/lib/css'
import { StarIcon } from './icons'

const SPARK_ANGLES = [0, 60, 120, 180, 240, 300]

function errorMessage(error: ApiError): string {
  // 429 do nosso rate limit já vem com a mensagem pronta do back-end
  return error.kind === 'rate_limited' ? error.message : 'Não foi possível curtir agora.'
}

/** Curtida repetível, como views: cada toque soma +1 no contador global da placa. */
export function LikeButton({ date, className }: { date: IsoDate; className?: string }) {
  const { count, like, error } = useLike(date)
  // Trocar a chave remonta os elementos e reinicia a animação CSS
  const [burst, setBurst] = useState(0)
  const liked = burst > 0

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button
        type="button"
        onClick={() => {
          like()
          setBurst((n) => n + 1)
        }}
        className={cn(
          'group label-mono inline-flex items-center gap-3 transition-colors duration-(--duration-quick) ease-out-quart',
          liked ? 'text-amber' : 'text-ink-muted hover:text-ink',
        )}
      >
        <span
          className={cn(
            'relative grid size-10 place-items-center border transition-[border-color,transform] duration-(--duration-base) ease-spring group-active:scale-90',
            liked ? 'border-amber/70' : 'border-rule group-hover:border-ink-faint',
          )}
        >
          <StarIcon key={`star-${burst}`} filled={liked} className={cn('size-4', liked && 'fav-star-pop')} />
          {liked ? (
            <span key={`burst-${burst}`} aria-hidden="true">
              {SPARK_ANGLES.map((a) => (
                <span key={a} className="fav-spark" style={{ '--a': `${a}deg` } as StyleWithVars} />
              ))}
            </span>
          ) : null}
        </span>
        <span>Curtir</span>
        <span className="tabular text-amber" aria-live="polite">
          {count === null ? '—' : count.toLocaleString('pt-BR')}
          <span className="sr-only"> curtidas</span>
        </span>
      </button>
      {error ? (
        <p role="status" className="label-mono text-ink-faint">
          {errorMessage(error)}
        </p>
      ) : null}
    </div>
  )
}
