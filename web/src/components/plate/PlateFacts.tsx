import type { Apod } from '@/api/types'
import { formatLongDate, formatWeekday, plateCode } from '@/lib/date'
import { cn } from '@/lib/cn'

const MEDIA_LABEL = { image: 'Imagem', video: 'Vídeo', other: 'Interativo' } as const

/** Ficha técnica da placa, em monoespaçada. */
export function PlateFacts({ apod, className }: { apod: Apod; className?: string }) {
  const rows: [string, string][] = [
    ['Data', formatLongDate(apod.date)],
    ['Dia', formatWeekday(apod.date)],
    ['Catálogo', plateCode(apod.date)],
    ['Mídia', MEDIA_LABEL[apod.media_type]],
    ['Crédito', apod.copyright ?? 'Domínio público · NASA'],
  ]

  return (
    <dl className={cn('divide-y divide-rule/70 border-y border-rule/70', className)}>
      {rows.map(([term, value]) => (
        <div key={term} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5">
          <dt className="label-mono text-ink-faint">{term}</dt>
          <dd className="tabular font-mono text-meta text-ink-muted first-letter:uppercase">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
