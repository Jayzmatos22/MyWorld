import { useState } from 'react'
import type { ApodVideo } from '@/api/types'
import { resolveVideo, videoPoster } from '@/lib/media'
import { PlayIcon } from '@/components/ui/icons'
import { PlateImage } from './PlateImage'

interface PlateVideoProps {
  apod: ApodVideo
  transitionName?: string | undefined
}

/**
 * Vídeo com "fachada": mostra só o pôster e carrega o player (iframe pesado
 * do YouTube/Vimeo) quando a pessoa pede. Arquivos .mp4 usam <video> nativo.
 */
export function PlateVideo({ apod, transitionName }: PlateVideoProps) {
  const [playing, setPlaying] = useState(false)
  const source = resolveVideo(apod.url)
  const poster = videoPoster(apod)

  if (source.kind === 'file') {
    return (
      <video
        controls
        preload="metadata"
        poster={poster ?? undefined}
        className="aspect-video w-full bg-night"
        style={transitionName ? { viewTransitionName: transitionName } : undefined}
      >
        <source src={source.src} />
        <a href={source.src}>Baixar o vídeo</a>
      </video>
    )
  }

  if (playing) {
    return (
      <div className="relative aspect-video w-full bg-night">
        <iframe
          src={source.embed}
          title={`Vídeo: ${apod.title}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setPlaying(true)
      }}
      className="group relative block aspect-video w-full overflow-hidden bg-night text-left"
    >
      {poster ? (
        <PlateImage src={poster} alt="" fit="cover" priority transitionName={transitionName} className="absolute inset-0" />
      ) : null}
      <span className="absolute inset-0 bg-void/35 transition-opacity duration-(--duration-base) ease-out-quart group-hover:opacity-60" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-18 place-items-center rounded-full border border-ink/60 bg-void/40 text-ink transition-[transform,border-color,color] duration-(--duration-base) ease-spring group-hover:scale-110 group-hover:border-amber group-hover:text-amber">
          <PlayIcon className="size-5 translate-x-px" />
        </span>
      </span>
      <span className="label-mono absolute bottom-3 left-3 text-ink">Reproduzir vídeo · {apod.title}</span>
    </button>
  )
}
