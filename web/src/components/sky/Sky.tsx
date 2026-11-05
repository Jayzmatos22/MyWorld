import { useRef } from 'react'
import { useLocation } from 'react-router'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useStarfield } from '@/hooks/useStarfield'
import { cn } from '@/lib/cn'

/** Páginas com o céu mais fundo: a nebulosa apaga e só as estrelas brilham */
const DEEP_SKY_PATHS = ['/sobre']

/** Fundo fixo: nebulosa (CSS) atrás, estrelas (canvas) na frente. */
export function Sky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const { pathname } = useLocation()
  const deep = DEEP_SKY_PATHS.includes(pathname)
  useStarfield(canvasRef, reducedMotion)

  return (
    <div aria-hidden="true">
      <div className={cn('nebula', deep && 'nebula--deep')}>
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
