import { useCallback, useState } from 'react'
import { likesApi } from '@/api/client'
import { type ApiError, toApiError } from '@/api/errors'
import type { IsoDate } from '@/api/types'
import { invalidate, writeCache } from '@/lib/query'
import { useQuery } from './useQuery'

const MINUTE = 60_000
const RANKING_SIZE = 30
const RANKING_KEY = 'likes:top'

const countKey = (date: IsoDate) => `likes:${date}`

/** Ranking da comunidade (página de favoritos). Curtir invalida o cache. */
export function useRanking() {
  return useQuery(RANKING_KEY, () => likesApi.top(RANKING_SIZE), MINUTE)
}

/**
 * Contador de curtidas de uma placa. A curtida é otimista: o número sobe na hora
 * e depois assume o valor do servidor (o maior, para cliques rápidos fora de ordem).
 * Se falhar, desfaz o +1 e expõe o erro.
 */
export function useLike(date: IsoDate) {
  const { state } = useQuery(countKey(date), () => likesApi.count(date), MINUTE)
  const [local, setLocal] = useState<number | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  const base = state.status === 'success' ? state.data.likes : null
  const count = local ?? base

  const like = useCallback(() => {
    setError(null)
    setLocal((current) => (current ?? base ?? 0) + 1)

    likesApi.like(date).then(
      (data) => {
        writeCache(countKey(date), data, MINUTE)
        invalidate(RANKING_KEY)
        setLocal((current) => Math.max(current ?? 0, data.likes))
      },
      (err: unknown) => {
        setLocal((current) => (current === null ? null : current - 1))
        setError(toApiError(err))
      },
    )
  }, [date, base])

  return { count, like, error }
}
