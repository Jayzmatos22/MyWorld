/*
 * Cache mínimo de requisições: memoriza respostas por chave (com validade)
 * e deduplica requisições em andamento. Duas telas pedindo a mesma data
 * geram uma única chamada — importante com a cota horária da NASA.
 */

interface Entry {
  data: unknown
  expiresAt: number
}

const store = new Map<string, Entry>()
const inflight = new Map<string, Promise<unknown>>()

export function readCache(key: string): unknown {
  const entry = store.get(key)
  if (!entry) return undefined
  if (entry.expiresAt < Date.now()) {
    store.delete(key)
    return undefined
  }
  return entry.data
}

export function writeCache(key: string, data: unknown, ttl: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttl })
}

export function invalidate(key: string): void {
  store.delete(key)
}

export function fetchCached<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
  const cached = readCache(key)
  if (cached !== undefined) return Promise.resolve(cached as T)

  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>

  const promise = fetcher()
    .then((data) => {
      writeCache(key, data, ttl)
      return data
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, promise)
  return promise
}
