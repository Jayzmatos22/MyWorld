import type { IsoDate } from './types'
import { ApiError, kindFromStatus } from './errors'
import { parseApod, parseApodList, parseErrorBody } from './parse'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

async function request<T>(path: string, parse: (json: unknown) => T, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
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
