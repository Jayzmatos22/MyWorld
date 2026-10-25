import type { IsoDate } from '@/api/types'

/** Primeira APOD publicada. */
export const APOD_FIRST_DAY = '1995-06-16' as IsoDate
export const MAX_RANGE_DAYS = 31

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DAY_MS = 86_400_000

export function isIsoDate(value: string): value is IsoDate {
  const match = ISO_PATTERN.exec(value)
  if (!match) return false
  const [, y, m, d] = match.map(Number) as [number, number, number, number]
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

/** Trabalha em UTC para que somar dias nunca esbarre em horário de verão. */
function toUtc(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d))
}

function fromUtc(date: Date): IsoDate {
  return date.toISOString().slice(0, 10) as IsoDate
}

export function todayIso(): IsoDate {
  const now = new Date()
  return fromUtc(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return fromUtc(new Date(toUtc(iso).getTime() + days * DAY_MS))
}

export function diffInDays(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / DAY_MS)
}

export function isWithinArchive(iso: IsoDate): boolean {
  return iso >= APOD_FIRST_DAY && iso <= todayIso()
}

export function dayOfYear(iso: IsoDate): number {
  const date = toUtc(iso)
  return diffInDays(fromUtc(new Date(Date.UTC(date.getUTCFullYear(), 0, 1))), iso) + 1
}

const longFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' })
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })

/** "25 de outubro de 2026" */
export function formatLongDate(iso: IsoDate): string {
  return longFormatter.format(toUtc(iso))
}

export function formatWeekday(iso: IsoDate): string {
  return weekdayFormatter.format(toUtc(iso))
}

/** "25·OUT·2026" — o carimbo das placas */
export function formatPlateDate(iso: IsoDate): string {
  const [y, , d] = iso.split('-')
  const month = monthFormatter.format(toUtc(iso)).replace('.', '').toUpperCase()
  return `${d ?? ''}·${month}·${y ?? ''}`
}

/** Número de catálogo no estilo do arquivo da NASA: AP261025 */
export function plateCode(iso: IsoDate): string {
  return `AP${iso.slice(2).replaceAll('-', '')}`
}

const ROMAN: readonly [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]

export function toRoman(value: number): string {
  let rest = value
  let out = ''
  for (const [n, numeral] of ROMAN) {
    while (rest >= n) {
      out += numeral
      rest -= n
    }
  }
  return out
}

/** Volume do arquivo: 1995 = I */
export function archiveVolume(iso: IsoDate): string {
  return toRoman(Number(iso.slice(0, 4)) - 1994)
}
