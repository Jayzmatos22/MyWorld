import type { ApiErrorCode } from './types'

export type ApiErrorKind = ApiErrorCode | 'network' | 'invalid_response' | 'unknown'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null
  /** Segundos até poder tentar de novo (só em `rate_limited`, quando a NASA informa). */
  readonly retryAfter: number | null

  constructor(kind: ApiErrorKind, message: string, status: number | null = null, retryAfter: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.retryAfter = retryAfter
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error instanceof TypeError) return new ApiError('network', 'Sem conexão com o servidor.')
  return new ApiError('unknown', error instanceof Error ? error.message : 'Erro inesperado.')
}

const KIND_BY_STATUS: Record<number, ApiErrorKind> = {
  400: 'bad_request',
  404: 'not_found',
  429: 'rate_limited',
  503: 'unavailable',
}

export function kindFromStatus(status: number): ApiErrorKind {
  return KIND_BY_STATUS[status] ?? (status >= 500 ? 'unavailable' : 'unknown')
}
