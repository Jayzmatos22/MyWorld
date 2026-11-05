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

/** URL externa só vira link/mídia se for http(s): bloqueia javascript:, data: e afins. */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null
  } catch {
    return null
  }
}

/*
 * Só YouTube e Vimeo viram player embutido (é o que a CSP do site libera em frame-src).
 * Qualquer outra origem vira link para a fonte: a URL vem da NASA, mas um iframe com
 * endereço arbitrário dentro do site seria uma porta para conteúdo malicioso.
 */
export type VideoSource =
  | { kind: 'youtube'; embed: string; id: string }
  | { kind: 'vimeo'; embed: string }
  | { kind: 'file'; src: string }
  | { kind: 'link'; href: string | null }

const FILE_PATTERN = /\.(mp4|webm|mov|m4v)$/i
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'])
const YOUTUBE_ID = /^[\w-]{11}$/
const VIMEO_ID = /^\d+$/

function youtubeId(url: URL): string | null {
  const raw =
    url.hostname === 'youtu.be'
      ? url.pathname.slice(1)
      : (url.pathname.split('/embed/')[1] ?? url.searchParams.get('v') ?? '')
  const id = raw.split(/[/?&]/)[0] ?? ''
  return YOUTUBE_ID.test(id) ? id : null
}

function vimeoId(url: URL): string | null {
  const parts = url.pathname.split('/').filter(Boolean)
  const id = url.hostname === 'player.vimeo.com' ? parts[1] : parts[0]
  return id && VIMEO_ID.test(id) ? id : null
}

export function resolveVideo(url: string): VideoSource {
  const safe = safeHttpUrl(url)
  if (!safe) return { kind: 'link', href: null }
  const parsed = new URL(safe)

  if (FILE_PATTERN.test(parsed.pathname)) return { kind: 'file', src: safe }

  if (YOUTUBE_HOSTS.has(parsed.hostname) || parsed.hostname === 'youtu.be') {
    const id = youtubeId(parsed)
    if (id) return { kind: 'youtube', id, embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` }
  }

  if (parsed.hostname === 'vimeo.com' || parsed.hostname === 'player.vimeo.com') {
    const id = vimeoId(parsed)
    if (id) return { kind: 'vimeo', embed: `https://player.vimeo.com/video/${id}?autoplay=1` }
  }

  return { kind: 'link', href: safe }
}

/** A NASA às vezes não manda miniatura de YouTube; o próprio YouTube tem uma. */
export function videoPoster(apod: Extract<Apod, { media_type: 'video' }>): string | null {
  if (apod.thumbnail_url) return safeHttpUrl(apod.thumbnail_url)
  const source = resolveVideo(apod.url)
  return source.kind === 'youtube' ? `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg` : null
}

/** Página oficial no arquivo clássico. */
export function nasaPermalink(date: string): string {
  return `https://apod.nasa.gov/apod/ap${date.slice(2).replaceAll('-', '')}.html`
}
