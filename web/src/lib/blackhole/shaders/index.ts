/*
 * Monta os shaders a partir dos chunks. Cada arquivo .glsl trata de um assunto (ruído,
 * estrelas, disco, lente, pós) e a ordem abaixo respeita as dependências entre eles.
 */
import bloomDown from './bloom-down.frag.glsl?raw'
import bloomUp from './bloom-up.frag.glsl?raw'
import disk from './chunks/disk.glsl?raw'
import lensing from './chunks/lensing.glsl?raw'
import noise from './chunks/noise.glsl?raw'
import post from './chunks/post.glsl?raw'
import stars from './chunks/stars.glsl?raw'
import composite from './composite.frag.glsl?raw'
import fullscreenVertex from './fullscreen.vert.glsl?raw'
import scene from './scene.frag.glsl?raw'

const HEADER = '#version 300 es\nprecision highp float;\nprecision highp int;\n'

export const FULLSCREEN_VERTEX = fullscreenVertex
export const SCENE_FRAGMENT = [HEADER, noise, stars, disk, lensing, scene].join('\n')
export const BLOOM_DOWN_FRAGMENT = HEADER + bloomDown
export const BLOOM_UP_FRAGMENT = HEADER + bloomUp
export const COMPOSITE_FRAGMENT = [HEADER, post, composite].join('\n')
