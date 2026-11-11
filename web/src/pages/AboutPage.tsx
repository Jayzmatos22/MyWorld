import { AboutHero } from '@/components/about/AboutHero'
import { ExternalAction } from '@/components/ui/ActionLink'
import { Reveal } from '@/components/ui/Reveal'
import { SplitTitle } from '@/components/ui/SplitTitle'

const AUTHOR = 'Jailton Santos'
const GITHUB_USER = 'Jayzmatos22'
const GITHUB_PROFILE = `https://github.com/${GITHUB_USER}`
const REPO_URL = `${GITHUB_PROFILE}/MyWorld`

const STATS = [
  { value: '1995', label: 'Primeira placa, em 16 de junho' },
  { value: '11 mil+', label: 'Placas no acervo' },
  { value: '3', label: 'Provedores de IA' },
  { value: '0', label: 'Rastreadores ou anúncios' },
] as const

const STEPS = [
  {
    title: 'Coleta',
    text: 'O servidor lê a rota apod-basic do science.nasa.gov, a mesma que alimenta o site oficial. A API clássica (api.nasa.gov) passou a devolver dados quebrados depois da migração do arquivo.',
  },
  {
    title: 'Limpeza',
    text: 'Cada placa chega com HTML misturado ao texto. O servidor limpa a explicação, extrai a imagem ou o player do vídeo e descarta placas incompletas em vez de mostrá-las pela metade.',
  },
  {
    title: 'Cache',
    text: 'Datas passadas não mudam: ficam guardadas por 24 horas. A placa do dia é revista a cada 30 minutos, porque a NASA às vezes publica com atraso.',
  },
  {
    title: 'IA ancorada',
    text: 'O “Pergunte à placa” manda ao modelo só a explicação daquela data, buscada pelo próprio servidor. A IA pode complementar com astronomia geral, mas avisa quando a informação não vem da NASA.',
  },
  {
    title: 'Comunidade',
    text: 'As curtidas formam o ranking da página de favoritos. Cada visitante tem um limite por minuto, e o IP vira um código irreversível: ele nunca é gravado.',
  },
  {
    title: 'Infraestrutura',
    text: 'Tudo roda sem servidor fixo na AWS: Lambda e DynamoDB na API, S3 e CloudFront no site, com política de segurança de conteúdo e um disjuntor de custo contra picos de tráfego.',
  },
] as const

function SectionIntro({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header className="col-span-full md:col-span-4">
      <Reveal index={0}>
        <p className="label-mono text-amber">{kicker}</p>
      </Reveal>
      <SplitTitle as="h2" text={title} className="mt-5 text-headline" />
    </header>
  )
}

function ProjectSection() {
  return (
    <section aria-label="O projeto" className="page-grid gap-y-10 pt-section">
      <SectionIntro kicker="01 · O projeto" title="Cada dia vira uma placa." />
      <div className="col-span-full md:col-span-7 md:col-start-6">
        <Reveal index={1}>
          <p className="text-lede text-ink">
            O MyWorld apresenta a Astronomy Picture of the Day da NASA como um arquivo editorial: cada data vira
            uma placa, com a imagem em destaque, a explicação original e os dados da observação.
          </p>
        </Reveal>
        <Reveal index={2}>
          <p className="mt-6 max-w-(--container-measure) text-ink-muted">
            Dá para abrir qualquer noite desde 16 de junho de 1995, ver intervalos lado a lado, sortear placas de
            todo o acervo, curtir as favoritas e perguntar a uma IA sobre o que aparece na imagem.
          </p>
        </Reveal>
      </div>
      <Reveal
        as="dl"
        index={3}
        className="col-span-full grid grid-cols-2 gap-x-gutter gap-y-8 border-t border-rule/60 pt-8 md:grid-cols-4"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-2">
            <dt className="label-mono text-ink-faint">{stat.label}</dt>
            <dd className="about-glow font-display text-headline text-ink">{stat.value}</dd>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

function MethodSection() {
  return (
    <section aria-label="Metodologia" className="page-grid gap-y-10 pt-section">
      <SectionIntro kicker="02 · Metodologia" title="Do arquivo da NASA à sua tela." />
      <ol className="col-span-full grid gap-x-gutter gap-y-10 sm:grid-cols-2 md:col-span-8 md:col-start-5">
        {STEPS.map((step, i) => (
          <Reveal as="li" key={step.title} index={i % 2} className="border-t border-rule/60 pt-5">
            <p className="label-mono tabular text-amber">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 text-title text-ink">{step.title}</h3>
            <p className="mt-3 text-ink-muted">{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}

function SourceSection() {
  return (
    <section aria-label="Fonte" className="page-grid gap-y-10 pt-section">
      <SectionIntro kicker="03 · Fonte" title="Astronomy Picture of the Day." />
      <div className="col-span-full md:col-span-7 md:col-start-6">
        <Reveal index={1}>
          <p className="text-lede text-ink">
            Criada em 16 de junho de 1995 pelos astrônomos Robert Nemiroff e Jerry Bonnell, a APOD publica uma
            imagem ou um vídeo do universo por dia, sempre com uma explicação escrita por um astrônomo profissional.
          </p>
        </Reveal>
        <Reveal index={2}>
          <p className="mt-6 max-w-(--container-measure) text-ink-muted">
            É um serviço da NASA com a Michigan Technological University. No MyWorld, as explicações aparecem no
            original, em inglês, e as imagens continuam dos seus autores: cada placa mostra o crédito e leva à
            página oficial.
          </p>
        </Reveal>
        <Reveal index={3} className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
          <ExternalAction href="https://apod.nasa.gov/apod/astropix.html">APOD de hoje na NASA</ExternalAction>
          <ExternalAction href="https://apod.nasa.gov/apod/archivepix.html">Arquivo completo</ExternalAction>
        </Reveal>
      </div>
    </section>
  )
}

function AuthorSection() {
  return (
    <section aria-label="Autoria" className="pt-section">
      <div className="about-horizon" aria-hidden="true" />
      <div className="page-grid justify-items-center gap-y-6 pt-16 text-center md:pt-24">
        <Reveal index={0} className="col-span-full">
          <p className="label-mono text-amber">04 · Autoria</p>
          <p className="label-mono mt-3 text-ink-faint">Feito por</p>
        </Reveal>
        <SplitTitle as="h2" text={AUTHOR} className="about-glow col-span-full text-display" />
        <Reveal index={2} className="col-span-full max-w-(--container-measure)">
          <p className="text-ink-muted">
            Projeto pessoal de estudo, do back-end em FastAPI ao front em React, publicado na AWS. O código é
            aberto: fique à vontade para explorar.
          </p>
        </Reveal>
        <Reveal index={3} className="col-span-full flex flex-wrap justify-center gap-x-8 gap-y-4">
          <ExternalAction href={GITHUB_PROFILE}>GitHub · {GITHUB_USER}</ExternalAction>
          <ExternalAction href={REPO_URL}>Código do MyWorld</ExternalAction>
        </Reveal>
        <Reveal index={4} className="col-span-full">
          <p className="label-mono text-ink-faint">Python · FastAPI · React · TypeScript · Tailwind · AWS</p>
        </Reveal>
      </div>
    </section>
  )
}

/** Sobre: abertura no estilo landing page e, rolando, projeto, metodologia, fonte e autoria. */
export function AboutPage() {
  return (
    <>
      <title>Sobre — MyWorld</title>
      <AboutHero repoUrl={REPO_URL} />
      <ProjectSection />
      <MethodSection />
      <SourceSection />
      <AuthorSection />
    </>
  )
}
