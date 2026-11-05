import { type RefObject, useEffect } from 'react'
import { BlackHoleFlow, type FlowGeometry } from '@/lib/blackHoleFlow'

/** object-position da <img> em fração (a media query de tela em pé muda o enquadramento) */
function readObjectPosition(image: HTMLImageElement): [number, number] {
  const [x = '50%', y = '50%'] = getComputedStyle(image).objectPosition.split(' ')
  return [parseFloat(x) / 100, parseFloat(y) / 100]
}

/**
 * Anima o buraco negro por cima da foto. O canvas só aparece (data-ready) depois do
 * primeiro quadro; sem WebGL, com "reduzir movimento" ou se o contexto cair, fica a
 * foto estática que está por baixo.
 */
export function useBlackHoleFlow(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  imageRef: RefObject<HTMLImageElement | null>,
  geometry: FlowGeometry,
  enabled: boolean,
): void {
  useEffect(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!enabled || !canvas || !image) return

    let engine: BlackHoleFlow
    try {
      engine = new BlackHoleFlow(canvas, geometry, () => {
        canvas.dataset.ready = ''
      })
    } catch {
      // Sem WebGL ou shader recusado pela GPU: a foto estática já está na tela
      return
    }

    const upload = () => {
      engine.setImage(image)
    }
    if (image.complete) upload()
    image.addEventListener('load', upload)

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      engine.resize(width, height, readObjectPosition(image))
    })
    resizeObserver.observe(canvas)

    const intersection = new IntersectionObserver(([entry]) => {
      engine.setInViewport(entry?.isIntersecting ?? true)
    })
    intersection.observe(canvas)

    const onVisibility = () => {
      engine.setPageVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', onVisibility)
    onVisibility()

    return () => {
      engine.destroy()
      delete canvas.dataset.ready
      image.removeEventListener('load', upload)
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [canvasRef, imageRef, geometry, enabled])
}
