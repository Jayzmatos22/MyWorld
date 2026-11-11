/*
 * Parâmetros do buraco negro da página Sobre.
 *
 * Espaço em raios de Schwarzschild (rs = 1): horizonte em r = 1, esfera de fótons em 1,5
 * e órbita estável mais interna (ISCO) em 3. A sombra vista de longe tem raio 3√3/2 ≈ 2,6:
 * é o parâmetro de impacto crítico, abaixo do qual a luz é capturada.
 */

/** Cor em RGB linear (0–1; valores acima de 1 são HDR) */
export type Rgb = [number, number, number]

/** Onde o buraco negro fica no hero */
export interface Framing {
  /** Centro em fração do hero: x a partir da esquerda, y a partir do topo */
  center: [number, number]
  /** Raio da sombra em fração da altura do hero */
  shadowRadius: number
}

export interface QualityTier {
  /** Resolução do ray-march em relação aos pixels do canvas */
  renderScale: number
  /** Máximo de passos do ray-march */
  steps: number
  /** Tamanho do passo em relação ao raio (maior = menos passos, menos precisão) */
  stepScale: number
}

export interface BlackHoleConfig {
  camera: {
    /** Distância da câmera ao buraco, em rs */
    distance: number
    /** Elevação acima do plano do disco, em graus (perto de 0 = disco de perfil) */
    inclinationDeg: number
    /** Giro da câmera em torno do eixo de visão: inclina o disco na tela */
    rollDeg: number
  }
  framing: {
    landscape: Framing
    portrait: Framing
  }
  disk: {
    innerRadius: number
    outerRadius: number
    /** Velocidade angular na borda interna, em rad/s; o resto segue ω ∝ r^-1,5 */
    speed: number
    /** Duração de cada camada de turbulência antes de renascer (limita o cisalhamento) */
    cycleSeconds: number
    opacity: number
    intensity: number
    /** Queda do brilho com a temperatura (maior = borda externa mais escura) */
    falloff: number
    /** 0 = disco liso, 1 = filamentos bem marcados */
    turbulence: number
    /** Força do domain warping no ruído */
    warp: number
    /** Células de ruído ao longo de uma volta e por rs no sentido radial */
    angularFrequency: number
    radialFrequency: number
    colorHot: Rgb
    colorWarm: Rgb
    colorCool: Rgb
  }
  doppler: {
    /** 0 desliga; 1 usa a velocidade orbital física (0,5c na ISCO) */
    strength: number
    /** Expoente do beaming: 3 é o valor físico para intensidade específica */
    power: number
  }
  stars: {
    density: number
    brightness: number
  }
  lens: {
    /** Reforço do anel de fótons na borda da sombra */
    photonRing: number
    /** Parâmetros de impacto (rs) entre os quais o céu do shader dá lugar ao céu do site */
    coverInner: number
    coverOuter: number
  }
  post: {
    exposure: number
    bloomThreshold: number
    bloomKnee: number
    bloomIntensity: number
    grain: number
    chromaticAberration: number
    /** Fração da altura em que a imagem se dissolve nas bordas de baixo e de cima do hero */
    fadeBottom: number
    fadeTop: number
  }
  breath: {
    /** Amplitude do pulso lento de brilho (0–1) */
    amount: number
    /** Ciclos de ruído por segundo */
    speed: number
  }
  interaction: {
    /** Inclinação máxima da câmera com o mouse, em graus */
    parallaxDeg: number
    /** Deslocamento máximo do centro, em fração da altura */
    parallaxShift: number
    stiffness: number
    damping: number
    /** Aproximação da câmera e ganho de bloom com o scroll do hero (0–1) */
    scrollZoom: number
    scrollBloom: number
  }
  quality: {
    maxPixelRatio: number
    initialTier: number
    tiers: QualityTier[]
  }
}

/** Raio aparente da sombra: 3√3/2 rs */
export const SHADOW_RADIUS = (3 * Math.sqrt(3)) / 2

export const DEFAULT_CONFIG: BlackHoleConfig = {
  camera: { distance: 30, inclinationDeg: 7, rollDeg: -11 },
  framing: {
    landscape: { center: [0.78, 0.53], shadowRadius: 0.165 },
    portrait: { center: [0.62, 0.77], shadowRadius: 0.1 },
  },
  disk: {
    innerRadius: 3,
    outerRadius: 12,
    speed: 0.9,
    cycleSeconds: 14,
    opacity: 0.96,
    intensity: 2.6,
    falloff: 2.2,
    turbulence: 0.85,
    warp: 0.55,
    angularFrequency: 9,
    radialFrequency: 1.6,
    colorHot: [1, 0.92, 0.8],
    colorWarm: [1, 0.52, 0.18],
    colorCool: [0.32, 0.09, 0.025],
  },
  doppler: { strength: 0.85, power: 3 },
  stars: { density: 0.6, brightness: 1.1 },
  lens: { photonRing: 0.7, coverInner: 4, coverOuter: 9 },
  post: {
    exposure: 1,
    bloomThreshold: 0.9,
    bloomKnee: 0.6,
    bloomIntensity: 0.6,
    grain: 0.035,
    chromaticAberration: 0.012,
    fadeBottom: 0.2,
    fadeTop: 0.12,
  },
  breath: { amount: 0.12, speed: 0.11 },
  interaction: {
    parallaxDeg: 2.5,
    parallaxShift: 0.012,
    stiffness: 38,
    damping: 12,
    scrollZoom: 0.14,
    scrollBloom: 0.7,
  },
  quality: {
    maxPixelRatio: 1.5,
    initialTier: 2,
    tiers: [
      { renderScale: 0.4, steps: 36, stepScale: 0.2 },
      { renderScale: 0.5, steps: 48, stepScale: 0.16 },
      { renderScale: 0.6, steps: 56, stepScale: 0.14 },
      { renderScale: 0.75, steps: 64, stepScale: 0.12 },
    ],
  },
}

type Overrides = { [K in keyof BlackHoleConfig]?: Partial<BlackHoleConfig[K]> }

/** Cópia do config com alguns grupos alterados; o original não é tocado */
export function withOverrides(base: BlackHoleConfig, overrides: Overrides): BlackHoleConfig {
  return {
    camera: { ...base.camera, ...overrides.camera },
    framing: { ...base.framing, ...overrides.framing },
    disk: { ...base.disk, ...overrides.disk },
    doppler: { ...base.doppler, ...overrides.doppler },
    stars: { ...base.stars, ...overrides.stars },
    lens: { ...base.lens, ...overrides.lens },
    post: { ...base.post, ...overrides.post },
    breath: { ...base.breath, ...overrides.breath },
    interaction: { ...base.interaction, ...overrides.interaction },
    quality: { ...base.quality, ...overrides.quality },
  }
}

export const PRESETS = {
  /** Discreto: movimento lento, pouco brilho; bom atrás de muito texto */
  sutil: withOverrides(DEFAULT_CONFIG, {
    disk: { speed: 0.55, intensity: 2.1, turbulence: 0.7 },
    doppler: { strength: 0.7 },
    post: { bloomIntensity: 0.38, grain: 0.02, chromaticAberration: 0.006 },
    breath: { amount: 0.06 },
    interaction: { parallaxDeg: 1.5, parallaxShift: 0.007, scrollZoom: 0.08, scrollBloom: 0.4 },
  }),
  padrao: DEFAULT_CONFIG,
  /** Cinema: mais rápido, mais contraste Doppler e bloom generoso */
  epico: withOverrides(DEFAULT_CONFIG, {
    disk: { speed: 1.25, intensity: 3.2, turbulence: 1, warp: 0.75 },
    doppler: { strength: 1, power: 3.4 },
    lens: { photonRing: 1.1 },
    post: { bloomIntensity: 0.95, bloomThreshold: 0.8, grain: 0.045, chromaticAberration: 0.02 },
    breath: { amount: 0.2 },
    interaction: { parallaxDeg: 3.5, parallaxShift: 0.018, scrollZoom: 0.22, scrollBloom: 1 },
  }),
} satisfies Record<string, BlackHoleConfig>

export type PresetName = keyof typeof PRESETS
