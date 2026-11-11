// ── Pós-processamento ───────────────────────────────────────────────────────
// Tudo antes daqui acontece em luz linear e HDR (valores acima de 1). Estas funções
// transformam essa luz no que o monitor consegue mostrar.

// ACES (ajuste de Narkowicz): comprime o HDR como um filme, preservando o contraste nos
// tons médios e dessaturando os brancos estourados em vez de recortá-los
vec3 acesTonemap(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

// Linear → sRGB, com a curva exata (trecho reto nos tons muito escuros)
vec3 linearToSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

float grainNoise(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
