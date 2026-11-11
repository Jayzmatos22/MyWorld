/**
 * Mola amortecida: o valor persegue o alvo sem nunca "colar" nele. Com amortecimento
 * perto de 2·√rigidez ela chega sem oscilar (amortecimento crítico).
 * Integração semi-implícita: estável para quadros de até uns 50 ms.
 */
export class Spring {
  value = 0
  velocity = 0
  target = 0

  step(dt: number, stiffness: number, damping: number): number {
    const acceleration = (this.target - this.value) * stiffness - this.velocity * damping
    this.velocity += acceleration * dt
    this.value += this.velocity * dt
    return this.value
  }

  /** Vai direto ao alvo (ex.: "reduzir movimento") */
  snap(): void {
    this.value = this.target
    this.velocity = 0
  }
}
