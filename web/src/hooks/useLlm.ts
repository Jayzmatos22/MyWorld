import { useCallback, useEffect, useRef, useState } from 'react'
import { llmApi } from '@/api/client'
import { type ApiError, toApiError } from '@/api/errors'
import type { ChatAnswer, ChatInput } from '@/api/types'
import { useQuery } from './useQuery'

const HOUR = 60 * 60_000

/** Provedores e modelos só mudam com deploy do back-end: 1h de cache basta. */
export function useProviders() {
  return useQuery('llm:providers', () => llmApi.providers(), HOUR)
}

export type AskState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ChatAnswer }
  | { status: 'error'; error: ApiError }

/**
 * Pergunta à IA. Sem cache: a mesma pergunta pode ter respostas diferentes.
 * Uma pergunta nova (ou sair da placa) cancela a que estava em andamento.
 */
export function useAsk() {
  const [state, setState] = useState<AskState>({ status: 'idle' })
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  const ask = useCallback((input: ChatInput) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState({ status: 'loading' })

    llmApi.chat(input, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', error: toApiError(error) })
      },
    )
  }, [])

  return { state, ask }
}
