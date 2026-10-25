import type { Apod } from '@/api/types'

/** Melhor imagem estática para miniatura/prévia, se houver. */
export function previewSrc(apod: Apod): string | null {
  switch (apod.media_type) {
    case 'image':
      return apod.url
    case 'video':
      return apod.thumbnail_url
    case 'other':
      return null
  }
}

export type VideoSource =
  | { kind: 'youtube'; embed: string; id: string }
  | { kind: 'vimeo'; embed: string }
  | { kind: 'file'; src: string }
  | { kind: 'iframe'; embed: string }

const FILE_PATTERN = /\.(mp4|webm|mov|m4v)(\?.*)?$/i

export function resolveVideo(url: string): VideoSource {
  if (FILE_PATTERN.test(url)) return { kind: 'file', src: url }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { kind: 'iframe', embed: url }
  }

  if (parsed.hostname.includes('youtube') || parsed.hostname === 'youtu.be') {
    const id =
      parsed.hostname === 'youtu.be'
        ? parsed.pathname.slice(1)
        : (parsed.pathname.split('/embed/')[1] ?? parsed.searchParams.get('v') ?? '')
    const clean = id.split(/[/?&]/)[0] ?? ''
    return { kind: 'youtube', id: clean, embed: `https://www.youtube-nocookie.com/embed/${clean}?autoplay=1&rel=0` }
  }

  if (parsed.hostname.includes('vimeo')) {
    parsed.searchParams.set('autoplay', '1')
    return { kind: 'vimeo', embed: parsed.toString() }
  }

  return { kind: 'iframe', embed: url }
}

/** A NASA às vezes não manda miniatura de YouTube; o próprio YouTube tem uma. */
export function videoPoster(apod: Extract<Apod, { media_type: 'video' }>): string | null {
  if (apod.thumbnail_url) return apod.thumbnail_url
  const source = resolveVideo(apod.url)
  return source.kind === 'youtube' && source.id ? `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg` : null
}

/** Página oficial no arquivo clássico. */
export function nasaPermalink(date: string): string {
  return `https://apod.nasa.gov/apod/ap${date.slice(2).replaceAll('-', '')}.html`
}
