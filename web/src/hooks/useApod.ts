import { useCallback, useState } from 'react'
import { apodApi } from '@/api/client'
import type { Apod, IsoDate } from '@/api/types'
import { writeCache } from '@/lib/query'
import { useQuery } from './useQuery'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

const dateKey = (date: IsoDate) => `apod:${date}`

/**
 * Cada lista recebida alimenta o cache individual por data. Assim, abrir os
 * detalhes a partir da galeria é instantâneo (e a View Transition tem a
 * imagem pronta no primeiro quadro).
 */
function seed(items: readonly Apod[]): void {
  for (const item of items) writeCache(dateKey(item.date), item, DAY)
}

export function useTodayApod() {
  return useQuery(
    'apod:today',
    async () => {
      const apod = await apodApi.today()
      seed([apod])
      return apod
    },
    15 * MINUTE,
  )
}

export function useApodByDate(date: IsoDate) {
  return useQuery(dateKey(date), () => apodApi.byDate(date), DAY)
}

export function useApodRange(start: IsoDate, end: IsoDate) {
  return useQuery(
    `range:${start}:${end}`,
    async () => {
      const items = await apodApi.range(start, end)
      seed(items)
      return items
    },
    30 * MINUTE,
  )
}

export function useRandomApods(count: number) {
  const [draw, setDraw] = useState(0)
  const query = useQuery(
    `random:${count}:${draw}`,
    async () => {
      const items = await apodApi.random(count)
      seed(items)
      return items
    },
    DAY,
  )
  const reroll = useCallback(() => {
    setDraw((n) => n + 1)
  }, [])
  return { ...query, reroll, draw }
}
