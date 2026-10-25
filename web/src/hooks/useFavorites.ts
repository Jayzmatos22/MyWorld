import { useSyncExternalStore } from 'react'
import type { IsoDate } from '@/api/types'
import { favoritesStore } from '@/lib/favorites'

export function useFavorites() {
  return useSyncExternalStore(favoritesStore.subscribe, favoritesStore.getSnapshot, favoritesStore.getServerSnapshot)
}

export function useIsFavorite(date: IsoDate): boolean {
  return useSyncExternalStore(
    favoritesStore.subscribe,
    () => favoritesStore.has(date),
    () => false,
  )
}
