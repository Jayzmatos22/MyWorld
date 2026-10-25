import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { type ApiError, toApiError } from '@/api/errors'
import { fetchCached, invalidate, readCache } from '@/lib/query'

export type QueryState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError }

interface Snapshot<T> {
  key: string
  state: QueryState<T>
}

function fromCache<T>(key: string): QueryState<T> {
  const data = readCache(key)
  return data === undefined ? { status: 'loading' } : { status: 'success', data: data as T }
}

export interface QueryResult<T> {
  state: QueryState<T>
  retry: () => void
}

/**
 * Busca com cache por chave. Se a resposta já estiver em cache, o primeiro
 * render já sai pronto — sem skeleton piscando e sem quebrar a View Transition.
 */
export function useQuery<T>(key: string, fetcher: () => Promise<T>, ttl: number): QueryResult<T> {
  const [snapshot, setSnapshot] = useState<Snapshot<T>>(() => ({ key, state: fromCache<T>(key) }))
  const [attempt, setAttempt] = useState(0)

  const fetcherRef = useRef(fetcher)
  useLayoutEffect(() => {
    fetcherRef.current = fetcher
  })

  // Chave mudou: ajusta o estado durante o render (padrão recomendado pelo React)
  let current = snapshot
  if (snapshot.key !== key) {
    current = { key, state: fromCache<T>(key) }
    setSnapshot(current)
  }

  const isLoading = current.state.status === 'loading'

  useEffect(() => {
    if (!isLoading) return
    let active = true

    fetchCached(key, () => fetcherRef.current(), ttl).then(
      (data) => {
        if (active) setSnapshot({ key, state: { status: 'success', data } })
      },
      (error: unknown) => {
        if (active) setSnapshot({ key, state: { status: 'error', error: toApiError(error) } })
      },
    )

    return () => {
      active = false
    }
  }, [key, ttl, isLoading, attempt])

  const retry = useCallback(() => {
    invalidate(key)
    setSnapshot({ key, state: { status: 'loading' } })
    setAttempt((n) => n + 1)
  }, [key])

  return { state: current.state, retry }
}
