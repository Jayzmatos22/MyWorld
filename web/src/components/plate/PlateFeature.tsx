import type { ReactNode } from 'react'
import type { Apod } from '@/api/types'
import { formatPlateDate, formatWeekday, plateCode } from '@/lib/date'
import { nasaPermalink } from '@/lib/media'
import { Reveal } from '@/components/ui/Reveal'
import { SplitTitle } from '@/components/ui/SplitTitle'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { ExternalAction } from '@/components/ui/ActionLink'
import { TextSkeleton, PlateSkeleton } from '@/components/ui/Skeleton'
import { CropMarks } from './CropMarks'
import { PlateFacts } from './PlateFacts'
import { PlateMedia } from './PlateMedia'

interface PlateFeatureProps {
  apod: Apod
  eyebrow: string
  /** Nome da View Transition para a mídia (página de detalhes) */
  transitionName?: string
  /** Navegação extra (dia anterior/seguinte) */
  navigation?: ReactNode
}

/**
 * A placa em destaque, em layout editorial:
 * coluna de catálogo estreita à esquerda, mídia sangrando até a borda direita,
 * título enorme invadindo a base da imagem e texto em coluna de leitura.
 */
export function PlateFeature({ apod, eyebrow, transitionName, navigation }: PlateFeatureProps) {
  const [day, month, year] = formatPlateDate(apod.date).split('·')

  return (
    <article className="page-grid gap-y-8 pt-6 md:gap-y-10 md:pt-14">
      <Reveal
        as="header"
        index={0}
        className="col-span-full flex items-end justify-between gap-6 md:col-span-3 md:flex-col md:items-start md:justify-start"
      >
        <div>
          <p className="label-mono text-amber">{eyebrow}</p>
          <p className="tabular mt-3 font-display text-headline font-[250] leading-[0.8] md:text-giant">{day}</p>
        </div>
        <p className="label-mono text-right text-ink-muted md:text-left">
          {month} · {year}
          <br />
          <span className="text-ink-faint">{formatWeekday(apod.date)}</span>
          <br />
          <span className="text-ink-faint">{plateCode(apod.date)}</span>
        </p>
        {navigation ? <div className="hidden md:mt-auto md:block md:w-full">{navigation}</div> : null}
      </Reveal>

      {/* Sem Reveal aqui: a mídia tem a própria entrada (cúpula) e precisa
          estar visível no primeiro quadro para a View Transition. */}
      <figure className="relative col-span-full -mx-gutter md:col-span-9 md:mx-0 md:-mr-gutter">
        <div className="flex justify-end md:[mask-image:linear-gradient(to_bottom,black_84%,transparent)]">
          <div className="relative w-full [&>*]:ml-auto">
            <PlateMedia apod={apod} transitionName={transitionName} />
          </div>
        </div>
        <CropMarks className="hidden md:block" />
        <figcaption className="sr-only">{apod.title}</figcaption>
      </figure>

      <SplitTitle
        key={apod.date}
        text={apod.title}
        className="relative col-span-full text-display md:col-span-10 title-bg md:-mt-[0.32em]"
      />

      <Reveal as="aside" index={1} className="col-span-full flex flex-col gap-8 md:col-span-3 md:row-span-2">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <FavoriteButton apod={apod} />
          {apod.media_type === 'image' && apod.hdurl ? (
            <ExternalAction href={apod.hdurl}>Alta resolução</ExternalAction>
          ) : null}
          <ExternalAction href={nasaPermalink(apod.date)}>Ver na NASA</ExternalAction>
        </div>
        <PlateFacts apod={apod} />
      </Reveal>

      <Reveal index={2} className="col-span-full md:col-span-6 md:col-start-5 lg:col-span-5 lg:col-start-6">
        <p className="label-mono mb-5 text-ink-faint">Explicação · em inglês, no original</p>
        <p lang="en" className="drop-cap max-w-(--container-measure) text-body text-ink/90">
          {apod.explanation}
        </p>
      </Reveal>

      {navigation ? <div className="col-span-full md:hidden">{navigation}</div> : null}
    </article>
  )
}

export function PlateFeatureSkeleton({ eyebrow }: { eyebrow: string }) {
  return (
    <div className="page-grid gap-y-8 pt-6 md:gap-y-10 md:pt-14" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando placa…</span>
      <div className="col-span-full md:col-span-3">
        <p className="label-mono text-amber">{eyebrow}</p>
        <span className="mt-4 block h-16 w-24 animate-blink bg-dusk md:h-40 md:w-40" />
      </div>
      <div className="relative col-span-full -mx-gutter md:col-span-9 md:mx-0 md:-mr-gutter">
        <PlateSkeleton className="aspect-[3/2] max-h-[78svh] w-full" />
        <CropMarks className="hidden md:block" />
      </div>
      <div className="col-span-full flex flex-col gap-4 md:col-span-8">
        <span className="h-12 w-11/12 animate-blink bg-dusk md:h-24" />
        <span className="h-12 w-2/3 animate-blink bg-dusk md:h-24" />
      </div>
      <div className="col-span-full md:col-span-3">
        <TextSkeleton lines={5} />
      </div>
      <TextSkeleton lines={6} className="col-span-full md:col-span-6 md:col-start-5 lg:col-span-5 lg:col-start-6" />
    </div>
  )
}
