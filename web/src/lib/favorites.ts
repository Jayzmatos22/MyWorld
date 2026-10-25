import type { Apod, IsoDate, MediaType } from '@/api/types'
import { isIsoDate } from './date'
import { previewSrc } from './media'

/*
 * Store externo de favoritos (localStorage), lido via useSyncExternalStore.
 * Guarda só o necessário para desenhar a lista; o resto vem da API sob demanda.
 * O evento `storage` mantém várias abas sincronizadas.
 */

export interface Favorite {
  date: IsoDate
  title: string
  mediaType: MediaType
  thumb: string | null
  savedAt: number
}

const STORAGE_KEY = 'myplanet:favoritos:v1'
const EMPTY: readonly Favorite[] = []

function isFavorite(value: unknown): value is Favorite {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.date === 'string' &&
    isIsoDate(v.date) &&
    typeof v.title === 'string' &&
    (v.mediaType === 'image' || v.mediaType === 'video' || v.mediaType === 'other') &&
    (typeof v.thumb === 'string' || v.thumb === null) &&
    typeof v.savedAt === 'number'
  )
}

function read(): readonly Favorite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isFavorite) : EMPTY
  } catch {
    return EMPTY
  }
}

let snapshot: readonly Favorite[] = read()
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function commit(next: readonly Favorite[]): void {
  snapshot = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Modo privado/cota cheia: mantém em memória durante a sessão
  }
  emit()
}

function onStorage(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY) return
  snapshot = read()
  emit()
}

export const favoritesStore = {
  subscribe: (listener: () => void): (() => void) => {
    if (listeners.size === 0) window.addEventListener('storage', onStorage)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) window.removeEventListener('storage', onStorage)
    }
  },

  getSnapshot: (): readonly Favorite[] => {
    return snapshot
  },

  getServerSnapshot: (): readonly Favorite[] => {
    return EMPTY
  },

  has: (date: IsoDate): boolean => {
    return snapshot.some((f) => f.date === date)
  },

  toggle: (apod: Apod): boolean => {
    if (favoritesStore.has(apod.date)) {
      commit(snapshot.filter((f) => f.date !== apod.date))
      return false
    }
    const entry: Favorite = {
      date: apod.date,
      title: apod.title,
      mediaType: apod.media_type,
      thumb: previewSrc(apod),
      savedAt: Date.now(),
    }
    commit([entry, ...snapshot])
    return true
  },
}
