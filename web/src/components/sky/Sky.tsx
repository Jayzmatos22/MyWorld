import { useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useStarfield } from '@/hooks/useStarfield'

/** Fundo fixo: nebulosa (CSS) atrás, estrelas (canvas) na frente. */
export function Sky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  useStarfield(canvasRef, reducedMotion)

  return (
    <div aria-hidden="true">
      <div className="nebula">
        <div className="nebula__cloud nebula__cloud--indigo" />
        <div className="nebula__cloud nebula__cloud--wine" />
        <div className="nebula__cloud nebula__cloud--dust" />
        <div className="nebula__veil" />
      </div>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-x-0 top-0 -z-1 h-lvh w-full [view-transition-name:sky]"
      />
    </div>
  )
}
