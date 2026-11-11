/*
 * Motor do buraco negro. Três etapas por quadro:
 *   1. Cena: ray-march com lente gravitacional, em resolução reduzida, num alvo HDR.
 *   2. Bloom: cadeia de reduções e ampliações do que passa do limiar.
 *   3. Composição: aberração cromática, ACES, grão e sRGB, na resolução do canvas.
 * Nada é alocado dentro do requestAnimationFrame.
 */
import { type BlackHoleConfig, type QualityTier, SHADOW_RADIUS } from './config'
import {
  createProgram,
  createTarget,
  deleteTarget,
  type RenderTarget,
  resizeTarget,
  supportsFloatTargets,
  type Uniforms,
  uniformLocations,
} from './gl'
import { AdaptiveQuality } from './quality'
import {
  BLOOM_DOWN_FRAGMENT,
  BLOOM_UP_FRAGMENT,
  COMPOSITE_FRAGMENT,
  FULLSCREEN_VERTEX,
  SCENE_FRAGMENT,
} from './shaders'
import { Spring } from './spring'

const BLOOM_LEVELS = 5
const NOISE_SIZE = 256
const NOISE_SLICE_X = 37 // mesmos valores de NOISE_SLICE em noise.glsl
const NOISE_SLICE_Y = 239
const DEG = Math.PI / 180
const MAX_FRAME_SECONDS = 0.1 // um quadro atrasado não faz a cena saltar
// Intervalo acima disto é pausa (janela encoberta ou aba em segundo plano, que o navegador
// limita a ~1 quadro por segundo), não GPU lenta: não conta para a qualidade adaptativa
const PAUSE_MS = 400
const STATIC_TIME = 9 // instante mostrado com "reduzir movimento"
const TIME_WRAP = 3600 // mantém a precisão do float no shader
const SPIN = 1 // com +1, o lado esquerdo do disco vem em direção à câmera
const GOLDEN = 0.6180339887
const FPS_WINDOW_MS = 500
const FALLBACK_TIER: QualityTier = { renderScale: 0.5, steps: 48, stepScale: 0.16 }

const SCENE_UNIFORMS = [
  'uNoise',
  'uPixelAngle',
  'uTime',
  'uCenter',
  'uCam',
  'uCamPos',
  'uSteps',
  'uStepScale',
  'uPhotonRing',
  'uCover',
  'uDiskIn',
  'uDiskOut',
  'uDiskSpeed',
  'uSpin',
  'uFlow',
  'uFlowSeed',
  'uDiskShape',
  'uDiskNoise',
  'uColorHot',
  'uColorWarm',
  'uColorCool',
  'uDoppler',
  'uBreath',
  'uStars',
] as const
const DOWN_UNIFORMS = ['uSource', 'uTexel', 'uThreshold'] as const
const UP_UNIFORMS = ['uSource', 'uTexel'] as const
const COMPOSITE_UNIFORMS = ['uScene', 'uBloom', 'uCenterUv', 'uPost', 'uFade', 'uTime'] as const

interface Pass<Name extends string> {
  program: WebGLProgram
  u: Uniforms<Name>
}

interface Resources {
  vao: WebGLVertexArrayObject
  noise: WebGLTexture
  scene: Pass<(typeof SCENE_UNIFORMS)[number]>
  down: Pass<(typeof DOWN_UNIFORMS)[number]>
  up: Pass<(typeof UP_UNIFORMS)[number]>
  composite: Pass<(typeof COMPOSITE_UNIFORMS)[number]>
  sceneTarget: RenderTarget
  bloom: RenderTarget[]
}

export interface EngineOptions {
  config: BlackHoleConfig
  /** Com "reduzir movimento": um único quadro, sem loop nem interação */
  reducedMotion: boolean
  onReady: () => void
  onContextLost: () => void
  onContextRestored: () => void
}

export interface EngineStats {
  fps: number
  tier: number
  renderScale: number
  steps: number
}

function createPass<const Names extends readonly string[]>(
  gl: WebGL2RenderingContext,
  fragment: string,
  names: Names,
): Pass<Names[number]> {
  const program = createProgram(gl, FULLSCREEN_VERTEX, fragment)
  return { program, u: uniformLocations(gl, program, names) }
}

/** Textura de ruído: R aleatório; G é o R deslocado, para o ruído 3D de uma leitura só */
function createNoiseTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const data = new Uint8Array(NOISE_SIZE * NOISE_SIZE * 4)
  let seed = 0x9e3779b9
  const random = (): number => {
    // mulberry32: determinístico, então o disco é igual em toda visita
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = 0; i < NOISE_SIZE * NOISE_SIZE; i++) {
    data[i * 4] = random() * 256
    data[i * 4 + 2] = random() * 256
    data[i * 4 + 3] = 255
  }
  for (let y = 0; y < NOISE_SIZE; y++) {
    for (let x = 0; x < NOISE_SIZE; x++) {
      const shifted = ((y + NOISE_SLICE_Y) % NOISE_SIZE) * NOISE_SIZE + ((x + NOISE_SLICE_X) % NOISE_SIZE)
      data[(y * NOISE_SIZE + x) * 4 + 1] = data[shifted * 4] ?? 0
    }
  }
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, NOISE_SIZE, NOISE_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  return texture
}

function fract(value: number): number {
  return value - Math.floor(value)
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

function lattice(index: number): number {
  return fract(Math.sin(index * 127.1 + 311.7) * 43758.5453)
}

/** Ruído suave em 1D, entre 0 e 1: duas oitavas, para o pulso não parecer um seno */
function smoothNoise(t: number): number {
  const i = Math.floor(t)
  const f = t - i
  const coarse = mix(lattice(i), lattice(i + 1), f * f * (3 - 2 * f))
  const j = Math.floor(t * 2.7)
  const g = t * 2.7 - j
  const fine = mix(lattice(j + 91), lattice(j + 92), g * g * (3 - 2 * g))
  return coarse * 0.7 + fine * 0.3
}

export class BlackHoleEngine {
  /** Cópia viva dos parâmetros: o painel de debug altera aqui e o próximo quadro já usa */
  readonly params: BlackHoleConfig
  readonly stats: EngineStats
  private readonly canvas: HTMLCanvasElement
  private readonly gl: WebGL2RenderingContext
  private readonly options: EngineOptions
  private readonly quality: AdaptiveQuality
  private readonly camera = new Float32Array(9)
  private readonly cameraPosition = new Float32Array(3)
  private readonly pointerX = new Spring()
  private readonly pointerY = new Spring()
  private readonly scroll = new Spring()
  private resources: Resources | null = null

  private cssWidth = 0
  private cssHeight = 0
  private time = 0
  private lastFrame = 0
  private rafId = 0
  private inViewport = true
  private pageVisible = true
  private lost = false
  private disposed = false
  private announced = false
  private fpsFrames = 0
  private fpsSince = 0

  /** Lança erro sem WebGL 2, sem alvo float ou com shader recusado: quem chama mostra o pôster */
  constructor(canvas: HTMLCanvasElement, options: EngineOptions) {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    })
    if (!gl) throw new Error('WebGL 2 indisponível')
    this.canvas = canvas
    this.gl = gl
    this.options = options
    this.params = structuredClone(options.config)
    this.quality = new AdaptiveQuality(this.params.quality.tiers.length, this.params.quality.initialTier)
    this.stats = { fps: 0, tier: this.quality.level, renderScale: 0, steps: 0 }
    try {
      this.resources = this.createResources()
    } catch (error) {
      // Solta o contexto já: o que foi criado até aqui morre junto
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      throw error
    }
    canvas.addEventListener('webglcontextlost', this.onContextLost)
    canvas.addEventListener('webglcontextrestored', this.onContextRestored)
  }

  /** Tamanho do canvas em pixels de CSS */
  resize(width: number, height: number): void {
    if (this.disposed || width === 0 || height === 0) return
    const ratio = Math.min(window.devicePixelRatio || 1, this.params.quality.maxPixelRatio)
    this.cssWidth = width
    this.cssHeight = height
    this.canvas.width = Math.round(width * ratio)
    this.canvas.height = Math.round(height * ratio)
    this.allocateTargets()
    // Mudar o tamanho apaga o canvas: redesenha na hora para não piscar
    this.render()
    this.wake()
  }

  setInViewport(visible: boolean): void {
    this.inViewport = visible
    this.wake()
  }

  setPageVisible(visible: boolean): void {
    this.pageVisible = visible
    this.wake()
  }

  /** Posição do mouse na janela, de −1 a 1 em cada eixo */
  setPointer(x: number, y: number): void {
    this.pointerX.target = Math.min(Math.max(x, -1), 1)
    this.pointerY.target = Math.min(Math.max(y, -1), 1)
  }

  /** Quanto do hero já rolou para fora da tela, de 0 a 1 */
  setScroll(progress: number): void {
    this.scroll.target = Math.min(Math.max(progress, 0), 1)
  }

  /** Troca todos os parâmetros de uma vez (ex.: um preset) sem recriar o motor */
  applyConfig(config: BlackHoleConfig): void {
    const copy = structuredClone(config)
    Object.assign(this.params.camera, copy.camera)
    Object.assign(this.params.framing, copy.framing)
    Object.assign(this.params.disk, copy.disk)
    Object.assign(this.params.doppler, copy.doppler)
    Object.assign(this.params.stars, copy.stars)
    Object.assign(this.params.lens, copy.lens)
    Object.assign(this.params.post, copy.post)
    Object.assign(this.params.breath, copy.breath)
    Object.assign(this.params.interaction, copy.interaction)
    this.redraw()
  }

  /** Redesenha um quadro fora do loop (painel de debug com a animação parada) */
  redraw(): void {
    if (this.rafId === 0) this.render()
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    cancelAnimationFrame(this.rafId)
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored)
    const gl = this.gl
    const r = this.resources
    if (r) {
      gl.deleteProgram(r.scene.program)
      gl.deleteProgram(r.down.program)
      gl.deleteProgram(r.up.program)
      gl.deleteProgram(r.composite.program)
      gl.deleteTexture(r.noise)
      gl.deleteVertexArray(r.vao)
      deleteTarget(gl, r.sceneTarget)
      for (const level of r.bloom) deleteTarget(gl, level)
    }
    this.resources = null
    // O canvas é exclusivo deste motor: soltar o contexto libera a GPU na hora, sem
    // esperar o coletor de lixo (o navegador limita quantos contextos ficam vivos)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  private createResources(): Resources {
    const gl = this.gl
    // Pedir a extensão é o que a ativa, e um contexto restaurado volta sem nenhuma:
    // por isso a checagem fica aqui, e não só no construtor
    if (!supportsFloatTargets(gl)) throw new Error('WebGL 2 sem framebuffer em ponto flutuante')
    const bloom: RenderTarget[] = []
    for (let i = 0; i < BLOOM_LEVELS; i++) bloom.push(createTarget(gl))
    const resources: Resources = {
      vao: gl.createVertexArray(),
      noise: createNoiseTexture(gl),
      scene: createPass(gl, SCENE_FRAGMENT, SCENE_UNIFORMS),
      down: createPass(gl, BLOOM_DOWN_FRAGMENT, DOWN_UNIFORMS),
      up: createPass(gl, BLOOM_UP_FRAGMENT, UP_UNIFORMS),
      composite: createPass(gl, COMPOSITE_FRAGMENT, COMPOSITE_UNIFORMS),
      sceneTarget: createTarget(gl),
      bloom,
    }
    // As unidades de textura de cada sampler nunca mudam: ficam gravadas no programa
    gl.useProgram(resources.scene.program)
    gl.uniform1i(resources.scene.u.uNoise, 0)
    gl.useProgram(resources.down.program)
    gl.uniform1i(resources.down.u.uSource, 0)
    gl.useProgram(resources.up.program)
    gl.uniform1i(resources.up.u.uSource, 0)
    gl.useProgram(resources.composite.program)
    gl.uniform1i(resources.composite.u.uScene, 0)
    gl.uniform1i(resources.composite.u.uBloom, 1)
    gl.disable(gl.DEPTH_TEST)
    gl.blendFunc(gl.ONE, gl.ONE) // usado só na subida do bloom
    return resources
  }

  private currentTier(): QualityTier {
    const tiers = this.params.quality.tiers
    return tiers[this.quality.level] ?? tiers[0] ?? FALLBACK_TIER
  }

  /** Alvos de render no tamanho do nível de qualidade atual */
  private allocateTargets(): void {
    const r = this.resources
    if (!r || this.canvas.width === 0) return
    const gl = this.gl
    const tier = this.currentTier()
    let width = Math.max(8, Math.round(this.canvas.width * tier.renderScale))
    let height = Math.max(8, Math.round(this.canvas.height * tier.renderScale))
    resizeTarget(gl, r.sceneTarget, width, height)
    for (const level of r.bloom) {
      width = Math.max(1, width >> 1)
      height = Math.max(1, height >> 1)
      resizeTarget(gl, level, width, height)
    }
    this.stats.tier = this.quality.level
    this.stats.renderScale = tier.renderScale
    this.stats.steps = tier.steps
  }

  private readonly onContextLost = (event: Event): void => {
    event.preventDefault() // sem isto o navegador nunca devolve o contexto
    this.lost = true
    cancelAnimationFrame(this.rafId)
    this.rafId = 0
    this.resources = null // os objetos de GPU morreram junto com o contexto
    this.options.onContextLost()
  }

  private readonly onContextRestored = (): void => {
    if (this.disposed) return
    try {
      this.resources = this.createResources()
    } catch {
      return // continua no pôster
    }
    this.lost = false
    this.announced = false
    this.allocateTargets()
    this.options.onContextRestored()
    this.render()
    this.wake()
  }

  private running(): boolean {
    return (
      !this.options.reducedMotion &&
      this.inViewport &&
      this.pageVisible &&
      !this.lost &&
      !this.disposed &&
      this.cssWidth > 0
    )
  }

  private wake(): void {
    if (!this.running() || this.rafId !== 0) return
    // Voltando de uma pausa: o primeiro intervalo não conta para o tempo nem para a média
    this.lastFrame = 0
    this.quality.reset()
    this.rafId = requestAnimationFrame(this.frame)
  }

  private readonly frame = (now: number): void => {
    this.rafId = 0
    if (!this.running()) return
    this.rafId = requestAnimationFrame(this.frame)

    if (this.lastFrame > 0) {
      const elapsed = now - this.lastFrame
      const dt = Math.min(elapsed / 1000, MAX_FRAME_SECONDS)
      const { stiffness, damping } = this.params.interaction
      this.time += dt
      this.pointerX.step(dt, stiffness, damping)
      this.pointerY.step(dt, stiffness, damping)
      this.scroll.step(dt, stiffness, damping)
      if (elapsed > PAUSE_MS) this.quality.reset()
      else if (this.quality.sample(elapsed)) this.allocateTargets()
    }
    this.lastFrame = now
    this.render()

    this.fpsFrames += 1
    if (now - this.fpsSince >= FPS_WINDOW_MS) {
      this.stats.fps = Math.round((this.fpsFrames * 1000) / (now - this.fpsSince))
      this.fpsFrames = 0
      this.fpsSince = now
    }
  }

  /** Câmera em órbita: sempre olha para o buraco; yaw e pitch vêm do parallax, em graus */
  private updateCamera(yawDeg: number, pitchDeg: number): void {
    const { distance, inclinationDeg, rollDeg } = this.params.camera
    const elevation = (inclinationDeg + pitchDeg) * DEG
    const azimuth = yawDeg * DEG
    const cosE = Math.cos(elevation)
    // Frente: da câmera para a origem (o disco está no plano y = 0)
    const fx = -Math.sin(azimuth) * cosE
    const fy = -Math.sin(elevation)
    const fz = Math.cos(azimuth) * cosE
    // Direita = cima do mundo × frente; cima = frente × direita
    const length = Math.hypot(fz, fx)
    const rx = fz / length
    const rz = -fx / length
    const ux = fy * rz
    const uy = fz * rx - fx * rz
    const uz = -fy * rx
    // Roll: gira direita e cima em torno do eixo de visão
    const c = Math.cos(rollDeg * DEG)
    const s = Math.sin(rollDeg * DEG)
    const m = this.camera
    m[0] = c * rx + s * ux
    m[1] = s * uy
    m[2] = c * rz + s * uz
    m[3] = -s * rx + c * ux
    m[4] = c * uy
    m[5] = -s * rz + c * uz
    m[6] = fx
    m[7] = fy
    m[8] = fz
    const position = this.cameraPosition
    position[0] = -fx * distance
    position[1] = -fy * distance
    position[2] = -fz * distance
  }

  private render(): void {
    const r = this.resources
    if (!r || this.lost || this.disposed || this.cssWidth === 0) return
    const gl = this.gl
    const p = this.params
    const tier = this.currentTier()
    const still = this.options.reducedMotion
    const time = still ? STATIC_TIME : this.time
    const scroll = still ? 0 : this.scroll.value
    const pointerX = still ? 0 : this.pointerX.value
    const pointerY = still ? 0 : this.pointerY.value
    const scene = r.sceneTarget

    // Enquadramento: transição contínua entre o de tela em pé e o de tela deitada
    const wide = smoothstep(0.8, 1.5, this.cssWidth / this.cssHeight)
    const { landscape, portrait } = p.framing
    const shift = p.interaction.parallaxShift * scene.height
    const centerX = mix(portrait.center[0], landscape.center[0], wide) * scene.width - pointerX * shift
    const centerY = (1 - mix(portrait.center[1], landscape.center[1], wide)) * scene.height + pointerY * shift
    // O scroll aproxima a câmera: a sombra cresce na tela
    const shadow = mix(portrait.shadowRadius, landscape.shadowRadius, wide) * (1 + p.interaction.scrollZoom * scroll)
    // A sombra tem raio angular SHADOW_RADIUS / distância; daí sai o ângulo de cada pixel
    const pixelAngle = SHADOW_RADIUS / (p.camera.distance * shadow * scene.height)
    this.updateCamera(pointerX * p.interaction.parallaxDeg, -pointerY * p.interaction.parallaxDeg * 0.6)

    // Duas camadas de turbulência defasadas em meio ciclo (ver disk.glsl)
    const cycle = time / p.disk.cycleSeconds
    const phase = fract(cycle)
    const seedA = fract(Math.floor(cycle) * GOLDEN) * 61
    const seedB = fract(Math.floor(cycle + 0.5) * GOLDEN + 0.5) * 61
    // Respiração: pulso lento guiado por ruído, não por um seno
    const breath = 1 + p.breath.amount * (2 * smoothNoise(time * p.breath.speed) - 1)

    // 1. Cena
    gl.bindVertexArray(r.vao)
    gl.disable(gl.BLEND)
    gl.bindFramebuffer(gl.FRAMEBUFFER, scene.framebuffer)
    gl.viewport(0, 0, scene.width, scene.height)
    gl.useProgram(r.scene.program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, r.noise)
    const u = r.scene.u
    gl.uniform1f(u.uPixelAngle, pixelAngle)
    gl.uniform1f(u.uTime, time % TIME_WRAP)
    gl.uniform2f(u.uCenter, centerX, centerY)
    gl.uniformMatrix3fv(u.uCam, false, this.camera)
    gl.uniform3fv(u.uCamPos, this.cameraPosition)
    gl.uniform1i(u.uSteps, tier.steps)
    gl.uniform1f(u.uStepScale, tier.stepScale)
    gl.uniform1f(u.uPhotonRing, p.lens.photonRing)
    gl.uniform2f(u.uCover, p.lens.coverInner, p.lens.coverOuter)
    gl.uniform1f(u.uDiskIn, p.disk.innerRadius)
    gl.uniform1f(u.uDiskOut, p.disk.outerRadius)
    gl.uniform1f(u.uDiskSpeed, p.disk.speed)
    gl.uniform1f(u.uSpin, SPIN)
    gl.uniform4f(u.uFlow, phase * p.disk.cycleSeconds, fract(cycle + 0.5) * p.disk.cycleSeconds, 1 - Math.abs(2 * phase - 1), 0)
    gl.uniform2f(u.uFlowSeed, seedA, seedB)
    gl.uniform4f(u.uDiskShape, p.disk.opacity, p.disk.intensity, p.disk.falloff, p.disk.turbulence)
    gl.uniform3f(u.uDiskNoise, p.disk.warp, p.disk.angularFrequency, p.disk.radialFrequency)
    gl.uniform3f(u.uColorHot, p.disk.colorHot[0], p.disk.colorHot[1], p.disk.colorHot[2])
    gl.uniform3f(u.uColorWarm, p.disk.colorWarm[0], p.disk.colorWarm[1], p.disk.colorWarm[2])
    gl.uniform3f(u.uColorCool, p.disk.colorCool[0], p.disk.colorCool[1], p.disk.colorCool[2])
    gl.uniform2f(u.uDoppler, p.doppler.strength, p.doppler.power)
    gl.uniform1f(u.uBreath, breath)
    gl.uniform2f(u.uStars, p.stars.density, p.stars.brightness)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    // 2. Bloom: desce reduzindo pela metade, depois sobe somando cada nível ao anterior
    gl.useProgram(r.down.program)
    let source = scene
    for (let i = 0; i < r.bloom.length; i++) {
      const target = r.bloom[i]
      if (!target) continue
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
      gl.viewport(0, 0, target.width, target.height)
      gl.bindTexture(gl.TEXTURE_2D, source.texture)
      gl.uniform2f(r.down.u.uTexel, 1 / source.width, 1 / source.height)
      gl.uniform3f(r.down.u.uThreshold, p.post.bloomThreshold, p.post.bloomKnee, i === 0 ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      source = target
    }
    gl.useProgram(r.up.program)
    gl.enable(gl.BLEND)
    for (let i = r.bloom.length - 1; i > 0; i--) {
      const small = r.bloom[i]
      const large = r.bloom[i - 1]
      if (!small || !large) continue
      gl.bindFramebuffer(gl.FRAMEBUFFER, large.framebuffer)
      gl.viewport(0, 0, large.width, large.height)
      gl.bindTexture(gl.TEXTURE_2D, small.texture)
      gl.uniform2f(r.up.u.uTexel, 1 / small.width, 1 / small.height)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    gl.disable(gl.BLEND)

    // 3. Composição, direto no canvas
    const bloomTop = r.bloom[0]
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.useProgram(r.composite.program)
    gl.bindTexture(gl.TEXTURE_2D, scene.texture)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, bloomTop ? bloomTop.texture : null)
    const post = r.composite.u
    gl.uniform2f(post.uCenterUv, centerX / scene.width, centerY / scene.height)
    gl.uniform4f(
      post.uPost,
      p.post.exposure,
      p.post.bloomIntensity * (1 + p.interaction.scrollBloom * scroll),
      p.post.grain,
      p.post.chromaticAberration,
    )
    gl.uniform2f(post.uFade, p.post.fadeBottom, p.post.fadeTop)
    gl.uniform1f(post.uTime, time % TIME_WRAP)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    // Solta a unidade 1: no próximo quadro esta textura volta a ser alvo de render
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.activeTexture(gl.TEXTURE0)

    if (!this.announced) {
      this.announced = true
      this.options.onReady()
    }
  }
}
