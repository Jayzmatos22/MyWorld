import { useRef } from 'react'
import { Link } from 'react-router'
import { useBlackHoleFlow } from '@/hooks/useBlackHoleFlow'
import { useEntrance } from '@/hooks/useEntrance'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { FlowGeometry } from '@/lib/blackHoleFlow'

/** Imagem de fundo do hero, em várias larguras (o navegador escolhe pelo tamanho da tela) */
export interface HeroImage {
  src: string
  srcSet: string
  width: number
  height: number
  /** Onde estão o centro, o anel e o disco na foto: guia o movimento */
  flow: FlowGeometry
}

/**
 * Foto do buraco negro. Em "lighten", as partes escuras deixam passar as estrelas
 * animadas do site. Por cima, um canvas WebGL faz o anel girar e o disco correr; a
 * <img> fica por baixo como base estática (sem WebGL ou com "reduzir movimento").
 */
function AboutPhoto({ image }: { image: HeroImage }) {
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  useBlackHoleFlow(canvasRef, imageRef, image.flow, !reducedMotion)

  return (
    <div className="about-photo" aria-hidden="true">
      <img
        ref={imageRef}
        src={image.src}
        srcSet={image.srcSet}
        sizes="100vw"
        width={image.width}
        height={image.height}
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      {reducedMotion ? null : <canvas ref={canvasRef} className="about-photo__flow" />}
    </div>
  )
}

/**
 * Abertura da página Sobre, na estrutura do prompt "Orbit" (selo, título de duas
 * linhas com máscara, subtítulo e dois botões, escalando juntos por --u) com a
 * identidade do MyWorld. A coreografia espera a fonte carregar e roda uma vez.
 */
export function AboutHero({ repoUrl, image }: { repoUrl: string; image: HeroImage }) {
  const { phase, onLastAnimationEnd } = useEntrance()

  return (
    <section className="about-hero" data-intro={phase === 'done' ? undefined : phase} aria-labelledby="sobre-titulo">
      <AboutPhoto image={image} />

      <div className="about-hero__copy">
        <Link to="/hoje" viewTransition className="about-pill">
          <span className="about-pill__chip">Novo</span>
          <span className="about-pill__label">Pergunte à placa com IA</span>
          <svg className="about-pill__arrow" viewBox="0 0 9.5 8" aria-hidden="true">
            <path
              d="M0.7 4H8.8M5.6 0.75 8.85 4 5.6 7.25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <h1 id="sobre-titulo" className="about-title">
          <span className="about-line">
            <span>O céu de cada dia,</span>
          </span>
          <span className="about-line about-line--soft">
            <span>guardado desde 1995.</span>
          </span>
        </h1>

        <p className="about-sub">Mais de 11 mil imagens astronômicas da NASA para ver, curtir e perguntar.</p>

        <div className="about-cta">
          <a className="about-btn about-btn--ghost" href={repoUrl} target="_blank" rel="noreferrer">
            Ver o código
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
          <Link className="about-btn about-btn--solid" to="/hoje" viewTransition onAnimationEnd={onLastAnimationEnd}>
            Placa de hoje
          </Link>
        </div>
      </div>
    </section>
  )
}
