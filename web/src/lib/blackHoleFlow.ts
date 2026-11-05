/*
 * Movimento do buraco negro da página Sobre (WebGL).
 *
 * A foto é estática; o shader a relê a cada quadro com um pequeno deslocamento
 * ("flow map"): no anel, o deslocamento gira em volta do centro; no disco, corre
 * ao longo da faixa; dentro da sombra é zero, então o centro fica parado. Só o gás claro
 * se move: o shader lê o brilho de cada ponto e deixa sombra e fundo escuros no lugar.
 * Duas leituras defasadas em meio ciclo se alternam, e o gás corre para sempre
 * sem esticar a imagem.
 */

export interface FlowGeometry {
  /** Centro da sombra, em uv da imagem (pode ficar fora de 0–1) */
  center: readonly [number, number]
  /** Raio da sombra, em fração da altura da imagem */
  shadowRadius: number
  /** Um ponto no eixo do disco, em uv da imagem */
  diskPoint: readonly [number, number]
  /** Sentido do fluxo no disco, em pixels da imagem (não precisa estar normalizado) */
  diskDirection: readonly [number, number]
  /** Meia espessura do disco, em fração da altura da imagem */
  diskHalfWidth: number
}

const MAX_PIXEL_RATIO = 1.5 // nitidez suficiente para um fundo; poupa a GPU no celular
const FRAME_MS = 1000 / 30 // movimento lento: 30 quadros por segundo bastam
const CYCLE_SECONDS = 11 // tempo para cada leitura percorrer o deslocamento inteiro
const DRIFT_PER_SECOND = 0.04 // velocidade da turbulência que varia o fluxo

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uStart;
uniform vec2 uSize;
uniform float uAspect;
uniform vec2 uPhase;
uniform float uDrift;
uniform vec2 uCenter;
uniform float uShadow;
uniform vec2 uDiskPoint;
uniform vec2 uDiskDir;
uniform float uDiskHalf;

const float RING_FLOW = 0.11;
const float DISK_FLOW = 0.05;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Onde ler a foto nesta fase do ciclo. p está no espaço "redondo" (x escalado pelo aspecto)
vec2 samplePosition(vec2 p, vec2 c, float phase, float gate) {
  vec2 d = p - c;
  float r = max(length(d), 0.0001);

  // Pesos: anel logo fora da sombra (some para fora); disco no meio da faixa
  float ring = smoothstep(uShadow, uShadow * 1.06, r) * (1.0 - smoothstep(uShadow * 1.5, uShadow * 1.95, r));
  vec2 q = p - vec2(uDiskPoint.x * uAspect, uDiskPoint.y);
  float across = abs(dot(q, vec2(-uDiskDir.y, uDiskDir.x)));
  float disk = 1.0 - smoothstep(uDiskHalf * 0.5, uDiskHalf * 1.4, across);
  // Perto do buraco (inclusive onde o disco passa na frente da sombra) o disco desacelera
  // sem mudar de direção: em velocidade cheia, arrastaria o traço vertical do pé do anel
  float nearHole = 1.0 - smoothstep(uShadow * 1.2, uShadow * 1.45, r);
  // Dentro da sombra (fora do disco) nada se move, e só o gás claro se desloca (gate):
  // sombra e fundo escuros ficam parados, sem a imagem rasgar onde os movimentos se encontram
  float keep = max(smoothstep(uShadow * 0.92, uShadow, r), disk) * gate;

  // Turbulência lenta: o gás não corre como uma esteira rígida
  float gust = 0.7 + 0.6 * noise(p * 5.0 + vec2(uDrift, -uDrift * 0.7));

  // Anel: GIRA em volta do centro (ângulo = arco / raio). Em linha reta, a borda
  // circular escorregaria para dentro e apareceria duplicada na troca de leituras
  float angle = -RING_FLOW * ring * gust * phase / r;
  float cs = cos(angle);
  float sn = sin(angle);
  vec2 ringP = c + vec2(cs * d.x - sn * d.y, sn * d.x + cs * d.y);

  // Disco: corre em linha reta ao longo da faixa
  vec2 diskP = p - uDiskDir * DISK_FLOW * gust * phase * (1.0 - 0.85 * nearHole);

  return mix(p, mix(ringP, diskP, disk), keep);
}

void main() {
  vec2 uv = uStart + vUv * uSize;
  vec2 p = vec2(uv.x * uAspect, uv.y);
  vec2 c = vec2(uCenter.x * uAspect, uCenter.y);
  // Brilho do próprio ponto: decide se ali é gás (move) ou sombra/fundo (fica)
  float lum = dot(texture2D(uImage, uv).rgb, vec3(0.2126, 0.7152, 0.0722));
  float gate = smoothstep(0.24, 0.42, lum);
  vec2 pa = samplePosition(p, c, uPhase.x, gate);
  vec2 pb = samplePosition(p, c, uPhase.y, gate);
  vec3 a = texture2D(uImage, vec2(pa.x / uAspect, pa.y)).rgb;
  vec3 b = texture2D(uImage, vec2(pb.x / uAspect, pb.y)).rgb;
  gl_FragColor = vec4(mix(a, b, abs(1.0 - 2.0 * uPhase.x)), 1.0);
}
`

const UNIFORMS = [
  'uImage',
  'uStart',
  'uSize',
  'uAspect',
  'uPhase',
  'uDrift',
  'uCenter',
  'uShadow',
  'uDiskPoint',
  'uDiskDir',
  'uDiskHalf',
] as const

type UniformName = (typeof UNIFORMS)[number]

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('WebGL: não foi possível criar o shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? ''
    gl.deleteShader(shader)
    throw new Error(`WebGL: shader inválido (${log})`)
  }
  return shader
}

function link(gl: WebGLRenderingContext): WebGLProgram {
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`WebGL: programa inválido (${gl.getProgramInfoLog(program) ?? ''})`)
  }
  return program
}

export class BlackHoleFlow {
  private readonly canvas: HTMLCanvasElement
  private readonly gl: WebGLRenderingContext
  private readonly program: WebGLProgram
  private readonly buffer: WebGLBuffer
  private readonly texture: WebGLTexture
  private readonly uniforms: Record<UniformName, WebGLUniformLocation | null>
  private readonly onReady: () => void

  private imageAspect = 1
  private width = 0
  private height = 0
  private position: readonly [number, number] = [0.5, 0.5]

  private hasImage = false
  private announced = false
  private inViewport = true
  private pageVisible = true
  private lost = false
  private destroyed = false
  private rafId = 0
  private lastDraw = 0

  /** Lança erro sem WebGL ou com shader inválido: quem chama mantém a foto estática */
  constructor(canvas: HTMLCanvasElement, geometry: FlowGeometry, onReady: () => void) {
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })
    if (!gl) throw new Error('WebGL indisponível')
    this.canvas = canvas
    this.gl = gl
    this.onReady = onReady
    this.program = link(gl)
    gl.useProgram(this.program)

    const uniforms = {} as Record<UniformName, WebGLUniformLocation | null>
    for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(this.program, name)
    this.uniforms = uniforms

    // Um triângulo que cobre a tela inteira
    const buffer = gl.createBuffer()
    this.buffer = buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(this.program, 'aPosition')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    this.texture = texture
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // Imagem sem potência de 2: WebGL 1 exige CLAMP e filtro sem mipmap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const [dx, dy] = geometry.diskDirection
    const length = Math.hypot(dx, dy) || 1
    gl.uniform1i(this.uniforms.uImage, 0)
    gl.uniform2f(this.uniforms.uCenter, geometry.center[0], geometry.center[1])
    gl.uniform1f(this.uniforms.uShadow, geometry.shadowRadius)
    gl.uniform2f(this.uniforms.uDiskPoint, geometry.diskPoint[0], geometry.diskPoint[1])
    gl.uniform2f(this.uniforms.uDiskDir, dx / length, dy / length)
    gl.uniform1f(this.uniforms.uDiskHalf, geometry.diskHalfWidth)

    canvas.addEventListener('webglcontextlost', this.onContextLost)
  }

  /** Sobe (ou troca) a foto: o srcset pode trocar de arquivo quando a tela cresce */
  setImage(image: HTMLImageElement): void {
    if (this.destroyed || this.lost || image.naturalWidth === 0) return
    const gl = this.gl
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    this.imageAspect = image.naturalWidth / image.naturalHeight
    gl.uniform1f(this.uniforms.uAspect, this.imageAspect)
    this.hasImage = true
    this.updateCover()
    this.draw(performance.now())
    this.wake()
  }

  /** Tamanho em CSS px e o object-position da foto (em fração), para recortar igual ao object-fit: cover */
  resize(width: number, height: number, position: readonly [number, number]): void {
    if (width === 0 || height === 0 || this.destroyed) return
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
    this.width = width
    this.height = height
    this.position = position
    this.canvas.width = Math.round(width * pixelRatio)
    this.canvas.height = Math.round(height * pixelRatio)
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.updateCover()
    // Mudar o tamanho apaga o canvas: redesenha na hora para não piscar
    this.draw(performance.now())
  }

  setInViewport(visible: boolean): void {
    this.inViewport = visible
    this.wake()
  }

  setPageVisible(visible: boolean): void {
    this.pageVisible = visible
    this.wake()
  }

  destroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.rafId)
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    const gl = this.gl
    gl.deleteTexture(this.texture)
    gl.deleteBuffer(this.buffer)
    gl.deleteProgram(this.program)
    // Sem loseContext(): o contexto é do canvas e volta igual no próximo getContext.
    // Perdê-lo aqui quebraria o motor seguinte no mesmo canvas (ex.: efeito remontado).
  }

  private readonly onContextLost = (event: Event): void => {
    // Sem contexto, a foto estática (por baixo) volta a aparecer sozinha
    event.preventDefault()
    this.lost = true
    cancelAnimationFrame(this.rafId)
    delete this.canvas.dataset.ready
  }

  private running(): boolean {
    return this.hasImage && this.inViewport && this.pageVisible && !this.lost && !this.destroyed
  }

  private wake(): void {
    if (this.running() && this.rafId === 0) this.rafId = requestAnimationFrame(this.frame)
  }

  private readonly frame = (now: number): void => {
    this.rafId = 0
    if (!this.running()) return
    this.rafId = requestAnimationFrame(this.frame)
    if (now - this.lastDraw < FRAME_MS) return
    this.draw(now)
  }

  private updateCover(): void {
    if (!this.hasImage || this.width === 0) return
    // Mesmo recorte do object-fit: cover + object-position da <img>
    const containerAspect = this.width / this.height
    const [px, py] = this.position
    const gl = this.gl
    if (containerAspect > this.imageAspect) {
      const visible = this.imageAspect / containerAspect
      gl.uniform2f(this.uniforms.uSize, 1, visible)
      gl.uniform2f(this.uniforms.uStart, 0, (1 - visible) * py)
    } else {
      const visible = containerAspect / this.imageAspect
      gl.uniform2f(this.uniforms.uSize, visible, 1)
      gl.uniform2f(this.uniforms.uStart, (1 - visible) * px, 0)
    }
  }

  private draw(now: number): void {
    if (!this.hasImage || this.width === 0 || this.lost || this.destroyed) return
    this.lastDraw = now
    const seconds = now / 1000
    const cycle = seconds / CYCLE_SECONDS
    const gl = this.gl
    // Fases calculadas aqui (precisão dupla): no shader, o tempo cresceria até perder precisão
    gl.uniform2f(this.uniforms.uPhase, cycle % 1, (cycle + 0.5) % 1)
    gl.uniform1f(this.uniforms.uDrift, (seconds * DRIFT_PER_SECOND) % 100)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (!this.announced) {
      this.announced = true
      this.onReady()
    }
  }
}
