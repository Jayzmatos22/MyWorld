import { Link } from 'react-router'
import { formatPlateDate } from '@/lib/date'
import { Reveal } from '@/components/ui/Reveal'
import { PlateSkeleton } from '@/components/ui/Skeleton'
import { PlateImage } from './PlateImage'
import type { SheetItem } from './ContactSheet'

/** Tira de negativos: as noites anteriores em sequência, com scroll-snap no celular. */
export function PlateStrip({ items }: { items: readonly SheetItem[] | null }) {
  const cells = items ?? Array.from({ length: 6 }, () => null)
  return (
    <ol className="flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-4 md:grid md:grid-cols-6 md:overflow-visible md:pb-0">
      {cells.map((item, i) => (
        <Reveal as="li" key={item?.date ?? i} index={i} className="w-[58vw] shrink-0 snap-start sm:w-[34vw] md:w-auto">
          {item ? (
            <Link to={`/placa/${item.date}`} viewTransition className="group block outline-offset-4">
              <div className="aspect-[4/5] overflow-hidden bg-night/60">
                {item.thumb ? (
                  <div className="size-full transition-transform duration-(--duration-slow) ease-out-expo group-hover:scale-[1.04]">
                    <PlateImage src={item.thumb} alt="" fit="cover" className="size-full" />
                  </div>
                ) : (
                  <div className="grid size-full place-items-center label-mono text-ink-faint">Sem prévia</div>
                )}
              </div>
              <p className="label-mono tabular mt-2.5 text-ink-muted group-hover:text-amber">{formatPlateDate(item.date)}</p>
              <p className="mt-1 line-clamp-2 font-display text-[1.05rem] leading-snug">{item.title}</p>
            </Link>
          ) : (
            <>
              <PlateSkeleton className="aspect-[4/5]" label="Revelando" />
              <span className="mt-3 block h-2 w-1/2 animate-blink bg-dusk" />
            </>
          )}
        </Reveal>
      ))}
    </ol>
  )
}
