import type { ChatInput, IsoDate } from './types'
import { ApiError, kindFromStatus } from './errors'
import {
  parseApod,
  parseApodList,
  parseChatAnswer,
  parseErrorBody,
  parseLikeCount,
  parseProviders,
  parseRanking,
} from './parse'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

/** Com `body`, vira POST com JSON; sem, GET. */
async function request<T>(path: string, parse: (json: unknown) => T, signal?: AbortSignal, body?: unknown): Promise<T> {
  const hasBody = body !== undefined
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json', ...(hasBody ? { 'Content-Type': 'application/json' } : {}) },
    ...(hasBody ? { method: 'POST', body: JSON.stringify(body) } : {}),
    ...(signal ? { signal } : {}),
  })

  const json: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const body = parseErrorBody(json)
    const retryAfterHeader = Number(response.headers.get('Retry-After'))
    throw new ApiError(
      body?.code ?? kindFromStatus(response.status),
      body?.message ?? `Erro ${response.status}`,
      response.status,
      Number.isFinite(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader : null,
    )
  }

  return parse(json)
}

export const apodApi = {
  today: (signal?: AbortSignal) => request('/apod/today', parseApod, signal),

  byDate: (date: IsoDate, signal?: AbortSignal) => request(`/apod/date/${date}`, parseApod, signal),

  range: (start: IsoDate, end: IsoDate, signal?: AbortSignal) =>
    request(`/apod/range?start=${start}&end=${end}`, parseApodList, signal),

  random: (count: number, signal?: AbortSignal) => request(`/apod/random?count=${count}`, parseApodList, signal),
}

export const llmApi = {
  providers: (signal?: AbortSignal) => request('/llm/providers', parseProviders, signal),

  chat: (input: ChatInput, signal?: AbortSignal) => request('/llm/chat', parseChatAnswer, signal, input),
}

export const likesApi = {
  count: (date: IsoDate, signal?: AbortSignal) => request(`/likes/${date}`, parseLikeCount, signal),

  /** Corpo vazio só para virar POST: a curtida é identificada pela data */
  like: (date: IsoDate, signal?: AbortSignal) => request(`/likes/${date}`, parseLikeCount, signal, {}),

  top: (limit: number, signal?: AbortSignal) => request(`/likes/top?limit=${limit}`, parseRanking, signal),
}
