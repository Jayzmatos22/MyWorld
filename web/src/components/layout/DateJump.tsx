import { useId, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router'
import { APOD_FIRST_DAY, isIsoDate, isWithinArchive, todayIso } from '@/lib/date'
import { cn } from '@/lib/cn'
import { ArrowIcon } from '@/components/ui/icons'

interface DateJumpProps {
  className?: string
  initial?: string
}

/** Busca por data: navega só no envio (digitar o ano não dispara requisições). */
export function DateJump({ className, initial = '' }: DateJumpProps) {
  const id = useId()
  const navigate = useNavigate()
  const [value, setValue] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const max = todayIso()

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isIsoDate(value) || !isWithinArchive(value)) {
      setError('Escolha uma data entre 16/06/1995 e hoje.')
      return
    }
    setError(null)
    void navigate(`/placa/${value}`, { viewTransition: true })
  }

  return (
    <form onSubmit={onSubmit} className={cn('group flex items-end gap-2', className)} noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="label-mono text-ink-muted">
          Observar data
        </label>
        <input
          id={id}
          type="date"
          min={APOD_FIRST_DAY}
          max={max}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-erro` : undefined}
          className="tabular h-9 border-b border-rule bg-transparent font-mono text-meta text-ink transition-colors duration-(--duration-quick) ease-out-quart hover:border-ink-faint focus-visible:border-amber focus-visible:outline-none"
        />
      </div>
      <button
        type="submit"
        className="grid size-9 place-items-center border border-rule text-ink-muted transition-[color,border-color] duration-(--duration-quick) ease-out-quart hover:border-amber hover:text-amber"
      >
        <ArrowIcon className="transition-transform duration-(--duration-base) ease-spring group-hover:translate-x-0.5" />
        <span className="sr-only">Ir para a data</span>
      </button>
      {error ? (
        <p id={`${id}-erro`} role="alert" className="label-mono basis-full text-signal-red normal-case tracking-normal">
          {error}
        </p>
      ) : null}
    </form>
  )
}
