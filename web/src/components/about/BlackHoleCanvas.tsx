import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { type BlackHoleConfig, DEFAULT_CONFIG } from '@/lib/blackhole/config'
import type { BlackHoleEngine } from '@/lib/blackhole/engine'

interface BlackHoleCanvasProps {
  /** Imagem estática mostrada quando o WebGL 2 não está disponível */
  poster: string
  config?: BlackHoleConfig
}

/** Liga o motor aos eventos do navegador; devolve a função que desfaz tudo */
function connect(host: HTMLElement, engine: BlackHoleEngine): () => void {
  // Medida do hero guardada a cada redimensionamento: o scroll não lê o layout
  let scrollRange = 1
  const onScroll = () => {
    engine.setScroll(window.scrollY / scrollRange)
  }
  const resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return
    const { width, height } = entry.contentRect
    scrollRange = Math.max(host.getBoundingClientRect().top + window.scrollY + height, 1)
    engine.resize(width, height)
    onScroll()
  })
  resizeObserver.observe(host)

  const intersection = new IntersectionObserver(([entry]) => {
    engine.setInViewport(entry?.isIntersecting ?? true)
  })
  intersection.observe(host)

  const onVisibility = () => {
    engine.setPageVisible(document.visibilityState === 'visible')
  }
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    engine.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
  }
  // Parallax só com mouse: no toque não há cursor para seguir
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('scroll', onScroll, { passive: true })
  if (hasMouse) window.addEventListener('pointermove', onPointer, { passive: true })
  onVisibility()

  // Painel de ajuste ao vivo: só em desenvolvimento e só com ?bh-debug na URL
  let closed = false
  let closeDebug: (() => void) | undefined
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('bh-debug')) {
    void import('@/lib/blackhole/debug').then((debug) => {
      if (!closed) closeDebug = debug.attachDebugPanel(engine)
    })
  }

  return () => {
    closed = true
    closeDebug?.()
    resizeObserver.disconnect()
    intersection.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('pointermove', onPointer)
  }
}

/**
 * Buraco negro em WebGL 2 atrás do hero. O componente só cuida do ciclo de vida: baixa o
 * motor (em arquivo separado, fora do pacote inicial), cria o canvas e desfaz tudo ao
 * desmontar. Sem WebGL 2, ou se o contexto cair, mostra o pôster.
 */
export function BlackHoleCanvas({ poster, config = DEFAULT_CONFIG }: BlackHoleCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    let teardown: (() => void) | undefined

    const start = ({ BlackHoleEngine }: typeof import('@/lib/blackhole/engine')) => {
      if (cancelled) return
      // Cada montagem cria o próprio canvas: ao desmontar, o contexto pode ser solto de
      // verdade sem afetar a montagem seguinte (o StrictMode monta duas vezes em dev)
      const canvas = document.createElement('canvas')
      canvas.className = 'about-bh__canvas'
      host.append(canvas)
      let engine: BlackHoleEngine
      try {
        engine = new BlackHoleEngine(canvas, {
          config,
          reducedMotion,
          onReady: () => {
            canvas.dataset.ready = ''
            setFailed(false)
          },
          onContextLost: () => {
            delete canvas.dataset.ready
            setFailed(true)
          },
          onContextRestored: () => undefined,
        })
      } catch (error) {
        if (import.meta.env.DEV) console.warn('[buraco negro] usando o pôster estático:', error)
        canvas.remove()
        setFailed(true)
        return
      }
      const disconnect = connect(host, engine)
      teardown = () => {
        disconnect()
        engine.dispose()
        canvas.remove()
      }
    }

    import('@/lib/blackhole/engine').then(start, () => {
      // O arquivo do motor não carregou (rede): fica o pôster
      if (!cancelled) setFailed(true)
    })

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [config, reducedMotion])

  return (
    <div ref={hostRef} className="about-bh" aria-hidden="true">
      {failed ? <img className="about-bh__poster" src={poster} alt="" decoding="async" /> : null}
    </div>
  )
}
