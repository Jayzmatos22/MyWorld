/* Utilitários de WebGL 2: programas, uniforms e alvos de render em ponto flutuante. */

export function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  // Depois de ligado, o programa não precisa mais dos shaders: soltar aqui evita vazamento
  gl.detachShader(program, vertex)
  gl.detachShader(program, fragment)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? ''
    gl.deleteProgram(program)
    throw new Error(`WebGL: programa inválido (${log})`)
  }
  return program
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
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

export type Uniforms<Name extends string> = Record<Name, WebGLUniformLocation | null>

export function uniformLocations<const Names extends readonly string[]>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  names: Names,
): Uniforms<Names[number]> {
  const locations = {} as Uniforms<Names[number]>
  for (const name of names) locations[name as Names[number]] = gl.getUniformLocation(program, name)
  return locations
}

/** Textura HDR (RGBA16F) com framebuffer próprio */
export interface RenderTarget {
  framebuffer: WebGLFramebuffer
  texture: WebGLTexture
  width: number
  height: number
}

export function createTarget(gl: WebGL2RenderingContext): RenderTarget {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  return { framebuffer, texture, width: 0, height: 0 }
}

/** Realoca a textura no novo tamanho (o conteúdo anterior é descartado) */
export function resizeTarget(gl: WebGL2RenderingContext, target: RenderTarget, width: number, height: number): void {
  if (target.width === width && target.height === height) return
  gl.bindTexture(gl.TEXTURE_2D, target.texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null)
  target.width = width
  target.height = height
}

export function deleteTarget(gl: WebGL2RenderingContext, target: RenderTarget): void {
  gl.deleteFramebuffer(target.framebuffer)
  gl.deleteTexture(target.texture)
}

/** Sem uma destas extensões, o WebGL 2 não deixa renderizar em textura float */
export function supportsFloatTargets(gl: WebGL2RenderingContext): boolean {
  return gl.getExtension('EXT_color_buffer_float') !== null || gl.getExtension('EXT_color_buffer_half_float') !== null
}
