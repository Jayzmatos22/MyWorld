/*
 * Campo de estrelas em <canvas> — motor imperativo, sem React no loop.
 *
 * - 3 camadas de profundidade com parallax (mouse + scroll) suavizado por
 *   interpolação exponencial dependente do delta time (independe do fps).
 * - Densidade proporcional à área da tela; DPR limitado para não estourar
 *   o fill-rate em celulares.
 * - Posições geradas em coordenadas normalizadas: quando a barra do
 *   navegador mobile aparece/some, o céu estica 2–3% em vez de "pular".
 * - O loop para sozinho com a aba oculta ou o canvas fora da viewport.
 */

export interface StarPalette {
  cool: string
  blue: string
  warm: string
}

interface Star {
  /** Posição normalizada 0–1 */
  nx: number
  ny: number
  size: number
  alpha: number
  /** Amplitude da cintilação (0 = estrela fixa) */
  twinkle: number
  freq: number
  phase: number
  tone: keyof StarPalette
}

interface Layer {
  depth: number
  stars: Star[]
  /** Estrelas grandes são desenhadas com sprite; as pequenas com fillRect. */
  sprite: boolean
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  length: number
  life: number
  age: number
}

const LAYERS = [
  { depth: 0.12, share: 0.62, size: [0.45, 0.95], alpha: [0.25, 0.6], sprite: false },
  { depth: 0.38, share: 0.29, size: [0.8, 1.35], alpha: [0.4, 0.8], sprite: false },
  { depth: 1, share: 0.09, size: [1.2, 2.1], alpha: [0.6, 0.95], sprite: true },
] as const

const AREA_PER_STAR = 1900 // px² por estrela
const MIN_STARS = 110
const MAX_STARS = 680
const POINTER_SHIFT = 28 // px de deslocamento máximo da camada mais próxima
const SCROLL_FACTOR = 0.18
const SMOOTHING = 3.2 // maior = segue o cursor mais rápido
const METEOR_INTERVAL: [number, number] = [7, 19] // segundos

/** PRNG determinístico (mulberry32): o mesmo céu a cada visita. */
function createRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const range = (rand: () => number, [min, max]: readonly [number, number]) => lerp(min, max, rand())

function pickTone(rand: () => number): keyof StarPalette {
  const r = rand()
  if (r < 0.1) return 'warm'
  if (r < 0.28) return 'blue'
  return 'cool'
}

function createSprite(color: string): HTMLCanvasElement {
  const size = 32
  const sprite = document.createElement('canvas')
  sprite.width = sprite.height = size
  const ctx = sprite.getContext('2d')
  if (!ctx) return sprite
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, color)
  g.addColorStop(0.18, color)
  g.addColorStop(0.32, 'rgb(230 232 240 / 0.18)')
  g.addColorStop(1, 'rgb(230 232 240 / 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return sprite
}

export interface StarfieldOptions {
  palette: StarPalette
  reducedMotion: boolean
}

export class Starfield {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly palette: StarPalette
  private readonly sprites: Record<keyof StarPalette, HTMLCanvasElement>
  private reducedMotion: boolean

  private layers: Layer[] = []
  private generatedArea = 0
  private width = 0
  private height = 0
  private dpr = 1

  private pointerTarget = { x: 0, y: 0 }
  private pointer = { x: 0, y: 0 }
  private scrollTarget = 0
  private scroll = 0

  private meteor: Meteor | null = null
  private nextMeteorAt = 0
  private readonly rand = createRandom(Date.now())

  private rafId = 0
  private lastTime: number | null = null
  private elapsed = 0
  private pageVisible = true
  private inViewport = true

  constructor(canvas: HTMLCanvasElement, options: StarfieldOptions) {
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) throw new Error('Canvas 2D indisponível')
    this.canvas = canvas
    this.ctx = ctx
    this.palette = options.palette
    this.reducedMotion = options.reducedMotion
    this.sprites = {
      cool: createSprite(options.palette.cool),
      blue: createSprite(options.palette.blue),
      warm: createSprite(options.palette.warm),
    }
    this.scheduleMeteor()
  }

  resize(width: number, height: number): void {
    if (width === 0 || height === 0) return
    const cores = navigator.hardwareConcurrency || 4
    this.dpr = Math.min(window.devicePixelRatio || 1, cores <= 4 ? 1.5 : 2)
    this.width = width
    this.height = height
    this.canvas.width = Math.round(width * this.dpr)
    this.canvas.height = Math.round(height * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)

    // Só regera se a área mudou bastante (rotação, janela redimensionada)
    const area = width * height
    if (this.layers.length === 0 || Math.abs(area - this.generatedArea) / this.generatedArea > 0.3) {
      this.generate(area)
    }
    this.draw()
  }

  setPointer(nx: number, ny: number): void {
    this.pointerTarget.x = nx
    this.pointerTarget.y = ny
  }

  setScroll(y: number): void {
    this.scrollTarget = y
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced
    this.meteor = null
    this.sync()
  }

  setPageVisible(visible: boolean): void {
    this.pageVisible = visible
    this.sync()
  }

  setInViewport(inViewport: boolean): void {
    this.inViewport = inViewport
    this.sync()
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId)
    this.rafId = 0
  }

  /** Liga/desliga o loop conforme visibilidade e preferência de movimento. */
  private sync(): void {
    const shouldRun = this.pageVisible && this.inViewport && !this.reducedMotion
    if (shouldRun && this.rafId === 0) {
      this.lastTime = null // evita um "salto" de dt ao voltar para a aba
      this.rafId = requestAnimationFrame(this.frame)
    } else if (!shouldRun && this.rafId !== 0) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
    if (this.reducedMotion) this.draw()
  }

  private generate(area: number): void {
    const rand = createRandom(0x5eed) // mesmo céu sempre
    const total = Math.round(Math.min(MAX_STARS, Math.max(MIN_STARS, area / AREA_PER_STAR)))
    this.generatedArea = area

    this.layers = LAYERS.map((spec) => {
      const count = Math.round(total * spec.share)
      const stars: Star[] = []
      for (let i = 0; i < count; i++) {
        const twinkles = rand() < 0.35
        stars.push({
          nx: rand(),
          ny: rand(),
          size: range(rand, spec.size),
          alpha: range(rand, spec.alpha),
          twinkle: twinkles ? lerp(0.45, 0.85, rand()) : lerp(0.04, 0.12, rand()),
          freq: lerp(0.35, 2.4, rand()),
          phase: rand() * Math.PI * 2,
          tone: pickTone(rand),
        })
      }
      // Agrupa por cor: menos trocas de fillStyle por quadro
      stars.sort((a, b) => a.tone.localeCompare(b.tone))
      return { depth: spec.depth, stars, sprite: spec.sprite }
    })
  }

  private scheduleMeteor(): void {
    this.nextMeteorAt = this.elapsed + lerp(METEOR_INTERVAL[0], METEOR_INTERVAL[1], this.rand())
  }

  private spawnMeteor(): void {
    const leftward = this.rand() < 0.5
    const angle = lerp(0.32, 0.6, this.rand()) // rad abaixo da horizontal
    const speed = lerp(720, 1150, this.rand())
    this.meteor = {
      x: lerp(0.15, 0.85, this.rand()) * this.width,
      y: lerp(0.02, 0.4, this.rand()) * this.height,
      vx: Math.cos(angle) * speed * (leftward ? -1 : 1),
      vy: Math.sin(angle) * speed,
      length: lerp(110, 230, this.rand()),
      life: lerp(0.6, 1.05, this.rand()),
      age: 0,
    }
  }

  private readonly frame = (now: number): void => {
    const dt = this.lastTime === null ? 0 : Math.min((now - this.lastTime) / 1000, 0.05)
    this.lastTime = now
    this.elapsed += dt

    // Suavização exponencial: mesma sensação a 30, 60 ou 120 fps
    const k = 1 - Math.exp(-dt * SMOOTHING)
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * k
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * k
    this.scroll += (this.scrollTarget - this.scroll) * k

    if (this.meteor) {
      this.meteor.age += dt
      this.meteor.x += this.meteor.vx * dt
      this.meteor.y += this.meteor.vy * dt
      if (this.meteor.age >= this.meteor.life) {
        this.meteor = null
        this.scheduleMeteor()
      }
    } else if (this.elapsed >= this.nextMeteorAt) {
      this.spawnMeteor()
    }

    this.draw()
    this.rafId = requestAnimationFrame(this.frame)
  }

  private draw(): void {
    const { ctx, width: w, height: h } = this
    ctx.clearRect(0, 0, w, h)
    const t = this.elapsed
    const animated = !this.reducedMotion

    for (const layer of this.layers) {
      const ox = animated ? -this.pointer.x * POINTER_SHIFT * layer.depth : 0
      const oy = animated ? -this.pointer.y * POINTER_SHIFT * layer.depth - this.scroll * SCROLL_FACTOR * layer.depth : 0
      let tone: keyof StarPalette | null = null

      for (const star of layer.stars) {
        // Módulo positivo: estrelas que saem por um lado voltam pelo outro
        const x = (((star.nx * w + ox) % w) + w) % w
        const y = (((star.ny * h + oy) % h) + h) % h
        const flicker = animated ? 0.5 + 0.5 * Math.sin(t * star.freq + star.phase) : 0.5
        ctx.globalAlpha = star.alpha * (1 - star.twinkle * flicker)

        if (layer.sprite) {
          const s = star.size * 7
          ctx.drawImage(this.sprites[star.tone], x - s / 2, y - s / 2, s, s)
        } else {
          if (tone !== star.tone) {
            tone = star.tone
            ctx.fillStyle = this.palette[tone]
          }
          ctx.fillRect(x, y, star.size, star.size)
        }
      }
    }

    if (this.meteor) this.drawMeteor(this.meteor)
    ctx.globalAlpha = 1
  }

  private drawMeteor(m: Meteor): void {
    const { ctx } = this
    const speed = Math.hypot(m.vx, m.vy)
    const tailX = m.x - (m.vx / speed) * m.length
    const tailY = m.y - (m.vy / speed) * m.length
    // Envelope: acende e apaga suavemente ao longo da vida
    const envelope = Math.sin(Math.PI * Math.min(1, m.age / m.life))

    const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY)
    gradient.addColorStop(0, this.palette.cool)
    gradient.addColorStop(0.15, 'rgb(243 217 166 / 0.55)')
    gradient.addColorStop(1, 'rgb(243 217 166 / 0)')

    ctx.globalAlpha = 0.9 * envelope
    ctx.strokeStyle = gradient
    ctx.lineWidth = 1.2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(tailX, tailY)
    ctx.stroke()
  }
}

export function readStarPalette(): StarPalette {
  const styles = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  return {
    cool: read('--color-star-cool', '#e6e8f0'),
    blue: read('--color-star-blue', '#b4c4ff'),
    warm: read('--color-star-warm', '#f3d9a6'),
  }
}
