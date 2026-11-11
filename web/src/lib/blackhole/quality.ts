/*
 * Qualidade adaptativa: mede o tempo entre quadros e troca de nível (resolução e passos
 * do ray-march). Desce rápido quando o quadro atrasa; sobe devagar, e, se a subida não
 * couber na GPU, volta e lembra o teto para não ficar oscilando.
 */

const SLOW_MS = 1000 / 50 // abaixo de 50 fps já é perceptível
const FAST_MS = 1000 / 57
const DOWN_AFTER_FRAMES = 24
const UP_AFTER_FRAMES = 300
const PROBATION_FRAMES = 150
const SMOOTHING = 0.1
const NOMINAL_MS = 1000 / 60
const MAX_SAMPLE_MS = 100

export class AdaptiveQuality {
  private tier: number
  private ceiling: number
  private average = NOMINAL_MS
  private frames = 0
  private probation = 0

  constructor(tierCount: number, initialTier: number) {
    this.ceiling = tierCount - 1
    this.tier = Math.min(Math.max(initialTier, 0), this.ceiling)
  }

  get level(): number {
    return this.tier
  }

  /** Esquece a média (ex.: ao voltar de uma pausa, o primeiro intervalo é enorme) */
  reset(): void {
    this.average = NOMINAL_MS
    this.frames = 0
  }

  /** Recebe o intervalo do último quadro; devolve true quando o nível mudou */
  sample(frameMs: number): boolean {
    this.average += (Math.min(frameMs, MAX_SAMPLE_MS) - this.average) * SMOOTHING
    this.frames += 1
    if (this.probation > 0) this.probation -= 1

    if (this.average > SLOW_MS && this.frames >= DOWN_AFTER_FRAMES && this.tier > 0) {
      // Atrasou logo depois de subir: esse nível não cabe nesta máquina
      if (this.probation > 0) this.ceiling = this.tier - 1
      this.tier -= 1
      this.probation = 0
      this.reset()
      return true
    }

    if (this.average < FAST_MS && this.frames >= UP_AFTER_FRAMES && this.tier < this.ceiling) {
      this.tier += 1
      this.probation = PROBATION_FRAMES
      this.reset()
      return true
    }

    return false
  }
}
