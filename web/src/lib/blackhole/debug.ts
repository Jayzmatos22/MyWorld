/*
 * Painel de ajuste ao vivo (lil-gui). É importado dinamicamente e só em desenvolvimento,
 * então não entra no pacote de produção. Abra a página com ?bh-debug na URL.
 */
import GUI from 'lil-gui'
import { PRESETS, type PresetName } from './config'
import type { BlackHoleEngine } from './engine'

export function attachDebugPanel(engine: BlackHoleEngine): () => void {
  const gui = new GUI({ title: 'Buraco negro' })
  const p = engine.params
  // Com a animação parada ("reduzir movimento"), cada ajuste redesenha um quadro
  gui.onChange(() => {
    engine.redraw()
  })

  const state: { preset: PresetName } = { preset: 'padrao' }
  gui
    .add(state, 'preset', Object.keys(PRESETS))
    .name('preset')
    .onChange((name: PresetName) => {
      engine.applyConfig(PRESETS[name])
      for (const controller of gui.controllersRecursive()) controller.updateDisplay()
    })

  const stats = gui.addFolder('Desempenho')
  stats.add(engine.stats, 'fps').listen().disable()
  stats.add(engine.stats, 'tier').name('nível').listen().disable()
  stats.add(engine.stats, 'renderScale').name('resolução').listen().disable()
  stats.add(engine.stats, 'steps').name('passos').listen().disable()

  const camera = gui.addFolder('Câmera').close()
  camera.add(p.camera, 'inclinationDeg', 0, 30, 0.1).name('inclinação')
  camera.add(p.camera, 'rollDeg', -45, 45, 0.1).name('giro')
  camera.add(p.framing.landscape.center, '0', 0, 1, 0.005).name('centro x')
  camera.add(p.framing.landscape.center, '1', 0, 1, 0.005).name('centro y')
  camera.add(p.framing.landscape, 'shadowRadius', 0.05, 0.4, 0.005).name('raio da sombra')

  const disk = gui.addFolder('Disco')
  disk.add(p.disk, 'speed', 0, 3, 0.01).name('velocidade')
  disk.add(p.disk, 'intensity', 0, 6, 0.05).name('intensidade')
  disk.add(p.disk, 'opacity', 0, 1, 0.01).name('opacidade')
  disk.add(p.disk, 'falloff', 0.5, 4, 0.05).name('queda')
  disk.add(p.disk, 'turbulence', 0, 1, 0.01).name('turbulência')
  disk.add(p.disk, 'warp', 0, 1.5, 0.01)
  disk.add(p.disk, 'angularFrequency', 1, 16, 1).name('células/volta')
  disk.add(p.disk, 'radialFrequency', 0.2, 4, 0.05).name('células/rs')
  disk.add(p.disk, 'innerRadius', 1.6, 6, 0.05).name('raio interno')
  disk.add(p.disk, 'outerRadius', 6, 16, 0.1).name('raio externo')
  disk.add(p.disk, 'cycleSeconds', 4, 40, 0.5).name('ciclo (s)')
  disk.addColor(p.disk, 'colorHot').name('cor quente')
  disk.addColor(p.disk, 'colorWarm').name('cor média')
  disk.addColor(p.disk, 'colorCool').name('cor fria')

  const physics = gui.addFolder('Doppler e lente')
  physics.add(p.doppler, 'strength', 0, 1, 0.01).name('Doppler')
  physics.add(p.doppler, 'power', 0, 5, 0.05).name('expoente')
  physics.add(p.lens, 'photonRing', 0, 3, 0.01).name('anel de fótons')
  physics.add(p.stars, 'brightness', 0, 3, 0.01).name('estrelas')
  physics.add(p.breath, 'amount', 0, 0.5, 0.01).name('respiração')

  const post = gui.addFolder('Pós')
  post.add(p.post, 'exposure', 0.2, 3, 0.01).name('exposição')
  post.add(p.post, 'bloomIntensity', 0, 2, 0.01).name('bloom')
  post.add(p.post, 'bloomThreshold', 0, 3, 0.01).name('limiar')
  post.add(p.post, 'grain', 0, 0.15, 0.001).name('grão')
  post.add(p.post, 'chromaticAberration', 0, 0.05, 0.001).name('aberração')

  const interaction = gui.addFolder('Interação').close()
  interaction.add(p.interaction, 'parallaxDeg', 0, 8, 0.1).name('parallax (graus)')
  interaction.add(p.interaction, 'stiffness', 5, 120, 1).name('rigidez')
  interaction.add(p.interaction, 'damping', 1, 30, 0.5).name('amortecimento')
  interaction.add(p.interaction, 'scrollZoom', 0, 0.5, 0.01).name('zoom no scroll')
  interaction.add(p.interaction, 'scrollBloom', 0, 2, 0.01).name('bloom no scroll')

  return () => {
    gui.destroy()
  }
}
