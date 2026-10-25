/** Data no formato AAAA-MM-DD, marcada no tipo para não se misturar com strings comuns. */
export type IsoDate = string & { readonly __brand: 'IsoDate' }

interface ApodBase {
  date: IsoDate
  title: string
  explanation: string
  copyright: string | null
}

export interface ApodImage extends ApodBase {
  media_type: 'image'
  url: string
  hdurl: string | null
}

export interface ApodVideo extends ApodBase {
  media_type: 'video'
  url: string
  thumbnail_url: string | null
}

/** Conteúdo interativo ou sem mídia incorporável (raro no arquivo). */
export interface ApodOther extends ApodBase {
  media_type: 'other'
  url: string | null
}

export type Apod = ApodImage | ApodVideo | ApodOther
export type MediaType = Apod['media_type']

/** Corpo de erro devolvido pelo FastAPI. */
export type ApiErrorCode = 'rate_limited' | 'not_found' | 'bad_request' | 'unavailable'

export interface ApiErrorBody {
  message: string
  code: ApiErrorCode
}
