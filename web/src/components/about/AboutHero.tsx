import { Link } from 'react-router'
import posterUrl from '@/assets/about/black-hole-poster.webp'
import { useEntrance } from '@/hooks/useEntrance'
import { BlackHoleCanvas } from './BlackHoleCanvas'

/**
 * Abertura da página Sobre, na estrutura do prompt "Orbit" (selo, título de duas
 * linhas com máscara, subtítulo e dois botões, escalando juntos por --u) com a
 * identidade do MyWorld. A coreografia espera a fonte carregar e roda uma vez.
 */
export function AboutHero({ repoUrl }: { repoUrl: string }) {
  const { phase, onLastAnimationEnd } = useEntrance()

  return (
    <section className="about-hero" data-intro={phase === 'done' ? undefined : phase} aria-labelledby="sobre-titulo">
      <BlackHoleCanvas poster={posterUrl} />
      {/* Escurece atrás do texto para a leitura não brigar com o disco */}
      <div className="about-hero__scrim" aria-hidden="true" />

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
