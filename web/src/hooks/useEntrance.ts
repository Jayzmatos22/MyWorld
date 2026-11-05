import { type AnimationEvent, useCallback, useEffect, useRef, useState } from 'react'

/**
 * Coreografia de abertura que roda uma vez:
 * - 'wait': tudo escondido, esperando a fonte (a máscara nunca revela a fonte de fallback)
 * - 'play': as animações rodam
 * - 'done': o atributo sai e nada fica com animation/will-change
 * Com "reduzir movimento", já começa em 'done'.
 */
export type EntrancePhase = 'wait' | 'play' | 'done'

const FONT_WAIT_MS = 700
const PLAY_FALLBACK_MS = 3000
const FAILSAFE_MS = 5000

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useEntrance() {
  const [phase, setPhase] = useState<EntrancePhase>(() => (prefersReducedMotion() ? 'done' : 'wait'))
  const startedRef = useRef(false)

  useEffect(() => {
    if (phase !== 'wait') return
    let cancelled = false
    let frame = 0

    // Dois quadros: o primeiro aplica o estado escondido, o segundo começa a animar
    const start = () => {
      if (cancelled || startedRef.current) return
      startedRef.current = true
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!cancelled) setPhase('play')
        })
      })
    }

    const fontTimer = window.setTimeout(start, FONT_WAIT_MS)
    void document.fonts.ready.then(start)
    // Aba em segundo plano não roda requestAnimationFrame: não deixa o conteúdo escondido
    const failsafe = window.setTimeout(() => {
      setPhase('done')
    }, FAILSAFE_MS)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.clearTimeout(fontTimer)
      window.clearTimeout(failsafe)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'play') return
    const timer = window.setTimeout(() => {
      setPhase('done')
    }, PLAY_FALLBACK_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [phase])

  /** Ligar no último elemento da coreografia: o fim dele encerra a entrada */
  const onLastAnimationEnd = useCallback((event: AnimationEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) setPhase('done')
  }, [])

  return { phase, onLastAnimationEnd }
}
