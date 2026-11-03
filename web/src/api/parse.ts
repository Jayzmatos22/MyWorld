import { isIsoDate } from '@/lib/date'
import { ApiError } from './errors'
import type {
  Apod,
  ApiErrorBody,
  ApiErrorCode,
  ChatAnswer,
  IsoDate,
  LikeCount,
  MediaType,
  ProviderId,
  ProviderOption,
  RankedPlate,
} from './types'

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

const PROVIDER_IDS: readonly ProviderId[] = ['nvidia', 'groq', 'google']

function providerId(value: unknown): ProviderId | null {
  return PROVIDER_IDS.find((id) => id === value) ?? null
}

function strList(obj: JsonObject, key: string): string[] {
  const value = obj[key]
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === 'string')) {
    throw invalid(`campo "${key}" não é uma lista de textos`)
  }
  return value
}

/** Provedor desconhecido é ignorado: o back-end pode ganhar um novo antes do front. */
export function parseProviders(value: unknown): ProviderOption[] {
  if (!Array.isArray(value)) throw invalid('lista esperada')
  return value.flatMap((item: unknown): ProviderOption[] => {
    if (!isObject(item)) throw invalid('provedor não é um objeto')
    const id = providerId(item.id)
    if (!id) return []
    return [{ id, name: str(item, 'name'), models: strList(item, 'models'), default_model: str(item, 'default_model') }]
  })
}

export function parseChatAnswer(value: unknown): ChatAnswer {
  if (!isObject(value)) throw invalid('resposta não é um objeto')
  const provider = providerId(value.provider)
  if (!provider) throw invalid('provedor desconhecido')
  return { provider, model: str(value, 'model'), response: str(value, 'response') }
}

function num(obj: JsonObject, key: string): number {
  const value = obj[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(`campo "${key}" não é número`)
  return value
}

function isoDate(obj: JsonObject, key: string): IsoDate {
  const value = str(obj, key)
  if (!isIsoDate(value)) throw invalid(`data "${value}" inválida`)
  return value
}

export function parseLikeCount(value: unknown): LikeCount {
  if (!isObject(value)) throw invalid('contagem não é um objeto')
  return { date: isoDate(value, 'date'), likes: num(value, 'likes') }
}

const MEDIA_TYPES: readonly MediaType[] = ['image', 'video', 'other']

export function parseRanking(value: unknown): RankedPlate[] {
  if (!Array.isArray(value)) throw invalid('lista esperada')
  return value.map((item: unknown): RankedPlate => {
    if (!isObject(item)) throw invalid('item do ranking não é um objeto')
    const mediaType = MEDIA_TYPES.find((m) => m === item.media_type)
    if (!mediaType) throw invalid('media_type desconhecido')
    return {
      date: isoDate(item, 'date'),
      title: str(item, 'title'),
      media_type: mediaType,
      thumb: optStr(item, 'thumb'),
      likes: num(item, 'likes'),
    }
  })
}

const ERROR_CODES: readonly ApiErrorCode[] =['rate_limited', 'not_found', 'bad_request', 'unavailable']

export function parseErrorBody(value: unknown): ApiErrorBody | null {
  if (!isObject(value)) return null
  const { message, code } = value
  if (typeof message !== 'string') return null
  const known = ERROR_CODES.find((c) => c === code)
  return known ? { message, code: known } : null
}
