import { Link, useViewTransitionState } from 'react-router'
import type { Apod, IsoDate, MediaType } from '@/api/types'
import { formatPlateDate, plateCode } from '@/lib/date'
import { previewSrc } from '@/lib/media'
import { cn } from '@/lib/cn'
import { Reveal } from '@/components/ui/Reveal'
import { PlateSkeleton } from '@/components/ui/Skeleton'
import { PlayIcon } from '@/components/ui/icons'
import { PlateImage } from './PlateImage'

export interface SheetItem {
  date: IsoDate
  title: string
  mediaType: MediaType
  thumb: string | null
}

export function toSheetItem(apod: Apod): SheetItem {
  return { date: apod.date, title: apod.title, mediaType: apod.media_type, thumb: previewSrc(apod) }
}

/*
 * Grid quebrado: um ciclo de 7 células com larguras, inícios de coluna,
 * proporções e deslocamentos verticais diferentes. No celular, o ciclo vira
 * "uma larga, duas estreitas".
 */
const PATTERN = [
  { cell: 'md:col-span-7', ratio: 'aspect-[4/3]' },
  { cell: 'md:col-span-4 md:col-start-9 md:mt-28', ratio: 'aspect-[4/5]' },
  { cell: 'md:col-span-4 md:col-start-2', ratio: 'aspect-square' },
  { cell: 'md:col-span-5 md:col-start-7 md:mt-16', ratio: 'aspect-[3/2]' },
  { cell: 'md:col-span-3', ratio: 'aspect-[3/4]' },
  { cell: 'md:col-span-5 md:col-start-5 md:mt-10', ratio: 'aspect-[16/10]' },
  { cell: 'md:col-span-3 md:col-start-10 md:mt-36', ratio: 'aspect-square' },
] as const

function layoutFor(index: number, offset: number) {
  const pattern = PATTERN[(index + offset) % PATTERN.length] ?? PATTERN[0]
  return { ...pattern, mobile: index % 3 === 0 ? 'col-span-4' : 'col-span-2' }
}

interface ContactSheetProps {
  items: readonly SheetItem[]
  /** Desloca o ciclo do padrão para páginas diferentes não parecerem iguais */
  offset?: number
  label: string
}

export function ContactSheet({ items, offset = 0, label }: ContactSheetProps) {
  return (
    <ol aria-label={label} className="page-grid gap-y-12 md:gap-y-20">
      {items.map((item, i) => (
        <SheetCell key={item.date} item={item} index={i} offset={offset} />
      ))}
    </ol>
  )
}

export function ContactSheetSkeleton({ count = 7, offset = 0 }: { count?: number; offset?: number }) {
  return (
    <div aria-busy="true" className="page-grid gap-y-12 md:gap-y-20">
      <span className="sr-only">Carregando placas…</span>
      {Array.from({ length: count }, (_, i) => {
        const layout = layoutFor(i, offset)
        return (
          <div key={i} className={cn(layout.mobile, layout.cell)}>
            <PlateSkeleton className={layout.ratio} />
            <span className="mt-3 block h-2 w-1/3 animate-blink bg-dusk" />
            <span className="mt-3 block h-4 w-3/4 animate-blink bg-dusk" />
          </div>
        )
      })}
    </div>
  )
}

function SheetCell({ item, index, offset }: { item: SheetItem; index: number; offset: number }) {
  const to = `/placa/${item.date}`
  // Só a célula envolvida na navegação recebe o nome da transição
  const transitioning = useViewTransitionState(to)
  const layout = layoutFor(index, offset)

  return (
    <Reveal as="li" index={index % 3} className={cn(layout.mobile, layout.cell)}>
      <Link to={to} viewTransition className="group block outline-offset-6">
        <div className={cn('relative overflow-hidden bg-night/60', layout.ratio)}>
          {item.thumb ? (
            <div className="size-full transition-transform duration-(--duration-slow) ease-out-expo group-hover:scale-[1.035]">
              <PlateImage
                src={item.thumb}
                alt=""
                fit="cover"
                transitionName={transitioning ? 'plate' : undefined}
                className="size-full"
              />
            </div>
          ) : (
            <div className="grid size-full place-items-center">
              <span className="label-mono text-ink-faint">Sem prévia</span>
            </div>
          )}
          {item.mediaType === 'video' ? (
            <span className="label-mono absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 bg-void/70 px-2 py-1 text-ink">
              <PlayIcon className="size-3" /> Vídeo
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <span className="label-mono tabular text-ink-muted transition-colors duration-(--duration-quick) group-hover:text-amber">
            {formatPlateDate(item.date)}
          </span>
          <span className="label-mono tabular hidden text-ink-faint sm:inline">{plateCode(item.date)}</span>
        </div>
        <h3 className="mt-1.5 text-title text-ink">{item.title}</h3>
      </Link>
    </Reveal>
  )
}
