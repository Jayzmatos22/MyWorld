import { useLayoutEffect, useRef, useState, type SyntheticEvent } from 'react'
import { cn } from '@/lib/cn'
import type { StyleWithVars } from '@/lib/css'

type PlateState = 'loading' | 'ready' | 'instant' | 'error'

interface PlateImageProps {
  src: string
  alt: string
  /** cover: recorta para caber na célula; natural: respeita a proporção da foto */
  fit: 'cover' | 'natural'
  priority?: boolean
  /** Altura máxima quando fit = natural (ex.: '78svh') */
  maxHeight?: string
  transitionName?: string | undefined
  className?: string
}

const DEFAULT_RATIO = 3 / 2

/**
 * Revelação progressiva:
 * 1. enquanto carrega, as folhas da cúpula ficam fechadas com uma linha de varredura;
 * 2. com a imagem decodificada (img.decode, sem travar o quadro), as folhas se
 *    abrem mostrando a cópia desfocada e a nítida surge por cima;
 * 3. no fim da transição as camadas auxiliares saem do DOM.
 * Se a imagem já estiver em cache, aparece pronta (estado `instant`) — essencial
 * para a View Transition capturar a foto e não uma placa vazia.
 */
export function PlateImage({ src, alt, fit, priority = false, maxHeight = '78svh', transitionName, className }: PlateImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [state, setState] = useState<PlateState>('loading')
  const [settled, setSettled] = useState(false)
  const [ratio, setRatio] = useState<number | null>(null)

  useLayoutEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setRatio(img.naturalWidth / img.naturalHeight)
      setState('instant')
      setSettled(true)
    }
  }, [])

  function onLoad(event: SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget
    setRatio(img.naturalWidth / img.naturalHeight)
    void img
      .decode()
      .catch(() => undefined)
      .then(() => {
        setState((s) => (s === 'loading' ? 'ready' : s))
      })
  }

  const naturalRatio = Math.min(2.6, Math.max(0.55, ratio ?? DEFAULT_RATIO))
  const frameStyle: StyleWithVars | undefined =
    fit === 'natural'
      ? { aspectRatio: naturalRatio, width: `min(100%, calc(${maxHeight} * ${naturalRatio}))` }
      : undefined

  return (
    <div data-plate-state={state} style={frameStyle} className={cn('relative overflow-hidden bg-night/80', className)}>
      {!settled && state !== 'error' ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
        />
      ) : null}

      {state === 'error' ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <p className="label-mono text-ink-muted">Placa danificada · imagem indisponível</p>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={onLoad}
          onError={() => {
            setState('error')
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName === 'opacity') setSettled(true)
          }}
          style={transitionName ? { viewTransitionName: transitionName } : undefined}
          className="plate-sharp relative block size-full object-cover"
        />
      )}

      {!settled && state !== 'error' ? (
        <>
          <span aria-hidden="true" className="plate-shutter absolute inset-y-0 left-0 w-1/2 border-r border-rule bg-abyss" />
          <span aria-hidden="true" className="plate-shutter plate-shutter--right absolute inset-y-0 right-0 w-1/2 bg-abyss" />
          {state === 'loading' ? <ScanLine /> : null}
        </>
      ) : null}
    </div>
  )
}

/** Linha de varredura do "scanner de placas" — também usada no skeleton. */
export function ScanLine({ label = 'Expondo placa' }: { label?: string }) {
  return (
    <span aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <span className="absolute inset-0 animate-scan bg-[linear-gradient(to_bottom,transparent_0%,rgb(232_184_107/0.07)_46%,rgb(232_184_107/0.22)_50%,transparent_51%)]" />
      <span className="label-mono absolute bottom-3 left-3 animate-blink text-ink-muted">{label}…</span>
    </span>
  )
}
