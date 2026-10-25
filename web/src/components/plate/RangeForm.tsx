import { useId, useState, type SubmitEvent } from 'react'
import type { IsoDate } from '@/api/types'
import { addDays, APOD_FIRST_DAY, diffInDays, isIsoDate, isWithinArchive, MAX_RANGE_DAYS, todayIso } from '@/lib/date'
import { Button } from '@/components/ui/Button'

interface RangeFormProps {
  start: IsoDate
  end: IsoDate
  onSubmit: (start: IsoDate, end: IsoDate) => void
}

export function validateRange(start: string, end: string): string | null {
  if (!isIsoDate(start) || !isIsoDate(end)) return 'Preencha as duas datas.'
  if (!isWithinArchive(start) || !isWithinArchive(end)) return 'O arquivo vai de 16/06/1995 até hoje.'
  if (start > end) return 'A data inicial precisa vir antes da final.'
  if (diffInDays(start, end) + 1 > MAX_RANGE_DAYS) return `Escolha no máximo ${MAX_RANGE_DAYS} dias.`
  return null
}

const PRESETS = [7, 14, 31] as const

const inputClass =
  'tabular h-10 w-full border-b border-rule bg-transparent font-mono text-meta text-ink hover:border-ink-faint focus-visible:border-amber focus-visible:outline-none'

export function RangeForm({ start, end, onSubmit }: RangeFormProps) {
  const id = useId()
  const [from, setFrom] = useState<string>(start)
  const [to, setTo] = useState<string>(end)
  const [error, setError] = useState<string | null>(null)
  const max = todayIso()

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem = validateRange(from, to)
    setError(problem)
    if (!problem && isIsoDate(from) && isIsoDate(to)) onSubmit(from, to)
  }

  function preset(days: number) {
    const last = todayIso()
    const first = addDays(last, -(days - 1))
    setFrom(first)
    setTo(last)
    setError(null)
    onSubmit(first, last)
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-x-8 gap-y-6 border-t border-rule/70 pt-6 sm:grid-cols-[1fr_1fr_auto]">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-de`} className="label-mono text-ink-muted">
          De
        </label>
        <input id={`${id}-de`} type="date" min={APOD_FIRST_DAY} max={max} value={from} onChange={(e) => { setFrom(e.target.value) }} className={inputClass} aria-describedby={error ? `${id}-erro` : undefined} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-ate`} className="label-mono text-ink-muted">
          Até
        </label>
        <input id={`${id}-ate`} type="date" min={APOD_FIRST_DAY} max={max} value={to} onChange={(e) => { setTo(e.target.value) }} className={inputClass} aria-describedby={error ? `${id}-erro` : undefined} />
      </div>
      <Button type="submit" className="self-end">
        Revelar placas
      </Button>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:col-span-3">
        <span className="label-mono text-ink-faint">Atalhos</span>
        {PRESETS.map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => {
              preset(days)
            }}
            className="label-mono text-ink-muted underline decoration-rule underline-offset-4 transition-colors duration-(--duration-quick) hover:text-amber hover:decoration-amber"
          >
            Últimos {days} dias
          </button>
        ))}
      </div>

      {error ? (
        <p id={`${id}-erro`} role="alert" className="font-mono text-meta text-signal-red sm:col-span-3">
          {error}
        </p>
      ) : null}
    </form>
  )
}
