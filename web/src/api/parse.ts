import { isIsoDate } from '@/lib/date'
import { ApiError } from './errors'
import type { Apod, ApiErrorBody, ApiErrorCode } from './types'

/*
 * Validação em runtime da resposta: o TypeScript só confia no que foi checado.
 * Sem bibliotecas — o contrato é pequeno e as funções de guarda bastam.
 */

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function str(obj: JsonObject, key: string): string {
  const value = obj[key]
  if (typeof value !== 'string') throw invalid(`campo "${key}" ausente`)
  return value
}

function optStr(obj: JsonObject, key: string): string | null {
  const value = obj[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function invalid(detail: string): ApiError {
  return new ApiError('invalid_response', `Resposta inesperada da API: ${detail}.`)
}

export function parseApod(value: unknown): Apod {
  if (!isObject(value)) throw invalid('item não é um objeto')

  const date = str(value, 'date')
  if (!isIsoDate(date)) throw invalid(`data "${date}" inválida`)

  const base = {
    date,
    title: str(value, 'title'),
    explanation: str(value, 'explanation'),
    copyright: optStr(value, 'copyright'),
  }

  switch (value.media_type) {
    case 'image':
      return { ...base, media_type: 'image', url: str(value, 'url'), hdurl: optStr(value, 'hdurl') }
    case 'video':
      return { ...base, media_type: 'video', url: str(value, 'url'), thumbnail_url: optStr(value, 'thumbnail_url') }
    case 'other':
      return { ...base, media_type: 'other', url: optStr(value, 'url') }
    default:
      throw invalid('media_type desconhecido')
  }
}

export function parseApodList(value: unknown): Apod[] {
  if (!Array.isArray(value)) throw invalid('lista esperada')
  return value.map(parseApod)
}

const ERROR_CODES: readonly ApiErrorCode[] = ['rate_limited', 'not_found', 'bad_request', 'unavailable']

export function parseErrorBody(value: unknown): ApiErrorBody | null {
  if (!isObject(value)) return null
  const { message, code } = value
  if (typeof message !== 'string') return null
  const known = ERROR_CODES.find((c) => c === code)
  return known ? { message, code: known } : null
}
