import { useId, useState, type KeyboardEvent, type SubmitEvent } from 'react'
import { Sparkles } from 'lucide-react'
import type { ApiError } from '@/api/errors'
import type { IsoDate, ProviderOption } from '@/api/types'
import { type AskState, useAsk, useProviders } from '@/hooks/useLlm'
import { Button } from '@/components/ui/Button'

/** Mesmo limite do back-end (ChatRequest.question). */
const MAX_QUESTION = 2000

const selectClass =
  'h-10 w-full cursor-pointer border-b border-rule bg-transparent font-mono text-meta text-ink hover:border-ink-faint focus-visible:border-amber focus-visible:outline-none disabled:cursor-default disabled:opacity-40 [&>option]:bg-night'

function errorMessage(error: ApiError): string {
  switch (error.kind) {
    // Mensagens do back-end já vêm prontas para o usuário (modelo inválido, data sem APOD…)
    case 'bad_request':
    case 'not_found':
    case 'network':
      return error.message
    case 'rate_limited':
      return 'Muitas perguntas seguidas. Espere um pouco e tente de novo.'
    case 'unavailable':
      return 'A IA não respondeu agora. Tente outro modelo ou provedor.'
    default:
      return 'Não foi possível obter a resposta.'
  }
}

/**
 * "Pergunte à placa": a IA responde só com base no APOD desta data.
 * O front manda apenas a data; o texto da NASA é buscado pelo back-end,
 * para ninguém conseguir trocar o contexto.
 */
export function PlateAsk({ date }: { date: IsoDate }) {
  const headingId = useId()
  const { state, retry } = useProviders()
  const initial = state.status === 'success' ? state.data[0] : undefined

  return (
    <section aria-labelledby={headingId} className="border-t border-rule/70 pt-6">
      <h2 id={headingId} className="label-mono flex items-center gap-2 text-amber">
        <Sparkles aria-hidden="true" size={14} strokeWidth={1.5} />
        Pergunte à placa
      </h2>
      <p className="mt-3 max-w-(--container-measure) text-ink-muted">
        A IA responde apenas com o que está na explicação desta placa.
      </p>

      {state.status === 'loading' ? <p className="label-mono mt-6 animate-blink text-ink-faint">Preparando o guia…</p> : null}

      {state.status === 'error' ? (
        <p className="mt-6 font-mono text-meta text-ink-muted">
          O guia de IA está indisponível agora.{' '}
          <button
            type="button"
            onClick={retry}
            className="underline decoration-rule underline-offset-4 transition-colors duration-(--duration-quick) hover:text-amber hover:decoration-amber"
          >
            Tentar de novo
          </button>
        </p>
      ) : null}

      {state.status === 'success' && initial ? <AskForm date={date} providers={state.data} initial={initial} /> : null}
    </section>
  )
}

interface AskFormProps {
  date: IsoDate
  providers: ProviderOption[]
  initial: ProviderOption
}

function AskForm({ date, providers, initial }: AskFormProps) {
  const id = useId()
  const [providerId, setProviderId] = useState(initial.id)
  const [model, setModel] = useState(initial.default_model)
  const [question, setQuestion] = useState('')
  const { state, ask } = useAsk()

  const provider = providers.find((p) => p.id === providerId) ?? initial
  const trimmed = question.trim()
  const isLoading = state.status === 'loading'
  const canSubmit = trimmed.length > 0 && !isLoading

  // Trocar de provedor volta para o modelo padrão dele: os modelos não se repetem entre provedores
  function changeProvider(next: string) {
    const found = providers.find((p) => p.id === next)
    if (!found) return
    setProviderId(found.id)
    setModel(found.default_model)
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSubmit) ask({ provider: provider.id, model, question: trimmed, date })
  }

  function submitOnShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <>
      <form onSubmit={submit} noValidate className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-provedor`} className="label-mono text-ink-muted">
            Provedor
          </label>
          <select
            id={`${id}-provedor`}
            value={provider.id}
            onChange={(e) => {
              changeProvider(e.target.value)
            }}
            disabled={isLoading}
            className={selectClass}
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-modelo`} className="label-mono text-ink-muted">
            Modelo
          </label>
          <select
            id={`${id}-modelo`}
            value={model}
            onChange={(e) => {
              setModel(e.target.value)
            }}
            disabled={isLoading}
            className={selectClass}
          >
            {provider.models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor={`${id}-pergunta`} className="label-mono text-ink-muted">
            Sua pergunta
          </label>
          <textarea
            id={`${id}-pergunta`}
            rows={3}
            maxLength={MAX_QUESTION}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
            }}
            onKeyDown={submitOnShortcut}
            placeholder="O que aparece nesta imagem?"
            aria-describedby={`${id}-dica`}
            className="w-full resize-y border-b border-rule bg-transparent py-2 text-body text-ink placeholder:text-ink-faint hover:border-ink-faint focus-visible:border-amber focus-visible:outline-none"
          />
          <p id={`${id}-dica`} className="tabular flex justify-between gap-4 font-mono text-micro text-ink-faint">
            <span>Ctrl/⌘ + Enter para enviar</span>
            <span>
              {question.length}/{MAX_QUESTION}
            </span>
          </p>
        </div>

        <Button type="submit" disabled={!canSubmit} className="justify-self-start sm:col-span-2">
          {isLoading ? 'Consultando…' : 'Perguntar'}
        </Button>
      </form>

      <Answer state={state} providers={providers} />
    </>
  )
}

/** Região viva: leitores de tela anunciam quando a resposta (ou o erro) chega. */
function Answer({ state, providers }: { state: AskState; providers: ProviderOption[] }) {
  return (
    <div aria-live="polite" aria-busy={state.status === 'loading'}>
      {state.status === 'loading' ? (
        <p className="label-mono mt-8 animate-blink text-ink-faint">A IA está lendo a placa…</p>
      ) : null}

      {state.status === 'error' ? (
        <p className="mt-8 font-mono text-meta text-signal-red">{errorMessage(state.error)}</p>
      ) : null}

      {state.status === 'success' ? (
        <figure className="mt-8 border-l border-amber/60 pl-5">
          <blockquote className="whitespace-pre-line text-body text-ink/90">
            {state.data.response || 'A IA não devolveu nenhum texto. Tente reformular a pergunta.'}
          </blockquote>
          <figcaption className="label-mono mt-4 text-ink-faint">
            {providers.find((p) => p.id === state.data.provider)?.name ?? state.data.provider} · {state.data.model} ·
            gerado por IA, pode conter erros
          </figcaption>
        </figure>
      ) : null}
    </div>
  )
}
