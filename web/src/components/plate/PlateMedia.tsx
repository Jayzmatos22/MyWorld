import type { Apod } from '@/api/types'
import { nasaPermalink } from '@/lib/media'
import { ArrowIcon } from '@/components/ui/icons'
import { PlateImage } from './PlateImage'
import { PlateVideo } from './PlateVideo'

interface PlateMediaProps {
  apod: Apod
  transitionName?: string | undefined
  priority?: boolean
}

/** Escolhe a mídia pela união discriminada — o switch é exaustivo. */
export function PlateMedia({ apod, transitionName, priority = true }: PlateMediaProps) {
  switch (apod.media_type) {
    case 'image':
      return (
        <PlateImage key={apod.url} src={apod.url} alt={apod.title} fit="natural" priority={priority} transitionName={transitionName} />
      )
    case 'video':
      return <PlateVideo key={apod.url} apod={apod} transitionName={transitionName} />
    case 'other':
      return (
        <div className="grid aspect-[3/2] w-full place-items-center bg-night/80 p-8 text-center">
          <div className="max-w-sm">
            <p className="label-mono text-ink-muted">Conteúdo interativo</p>
            <p className="mt-3 font-display text-title">Esta placa só pode ser vista no arquivo da NASA.</p>
            <a
              href={apod.url ?? nasaPermalink(apod.date)}
              target="_blank"
              rel="noreferrer"
              className="label-mono mt-6 inline-flex items-center gap-2 text-amber underline-offset-4 hover:underline"
            >
              Abrir na NASA <ArrowIcon direction="up-right" />
            </a>
          </div>
        </div>
      )
  }
}
