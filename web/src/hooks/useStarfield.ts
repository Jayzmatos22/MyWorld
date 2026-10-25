import { type RefObject, useEffect, useRef } from 'react'
import { Starfield, readStarPalette } from '@/lib/starfield'

/**
 * Liga o motor do campo de estrelas aos eventos do navegador.
 * Todos os listeners são passivos e só gravam alvos; o desenho acontece
 * no próximo quadro do requestAnimationFrame.
 */
export function useStarfield(canvasRef: RefObject<HTMLCanvasElement | null>, reducedMotion: boolean): void {
  const engineRef = useRef<Starfield | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new Starfield(canvas, { palette: readStarPalette(), reducedMotion })
    engineRef.current = engine

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      engine.resize(width, height)
    })
    resizeObserver.observe(canvas)

    const intersection = new IntersectionObserver(([entry]) => {
      engine.setInViewport(entry?.isIntersecting ?? true)
    })
    intersection.observe(canvas)

    const onVisibility = () => {
      engine.setPageVisible(document.visibilityState === 'visible')
    }

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      engine.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    }

    const onScroll = () => {
      engine.setScroll(window.scrollY)
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    onVisibility()
    onScroll()

    return () => {
      engine.destroy()
      engineRef.current = null
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
    }
    // O motor é criado uma vez; a preferência de movimento é aplicada abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  useEffect(() => {
    engineRef.current?.setReducedMotion(reducedMotion)
  }, [reducedMotion])
}
