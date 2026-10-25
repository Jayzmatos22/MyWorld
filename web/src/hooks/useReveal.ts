import { useCallback } from 'react'
import { observeReveal } from '@/lib/reveal'

/** Ref callback que registra o elemento no observer de revelação. */
export function useReveal(): (element: Element | null) => (() => void) | undefined {
  return useCallback((element: Element | null) => (element ? observeReveal(element) : undefined), [])
}
