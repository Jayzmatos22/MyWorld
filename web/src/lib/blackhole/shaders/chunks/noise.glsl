// ── Compartilhado ───────────────────────────────────────────────────────────
uniform float uPixelAngle; // tangente do ângulo coberto por um pixel do alvo
uniform float uTime;       // segundos

// ── Ruído ───────────────────────────────────────────────────────────────────
uniform sampler2D uNoise; // 256×256 aleatória, com repetição e filtro linear

const float NOISE_SIZE = 256.0;
// O ruído é 3D, mas mora numa textura 2D: cada "fatia" em z é a mesma imagem deslocada
// por este vetor. O canal G guarda o canal R já deslocado, então UMA leitura traz as duas
// fatias vizinhas, e a interpolação bilinear da GPU faz o resto do trabalho.
const vec2 NOISE_SLICE = vec2(37.0, 239.0);

float noise3(vec3 p) {
  vec3 cell = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // curva suave no lugar da interpolação linear
  vec2 uv = cell.xy + NOISE_SLICE * cell.z + f.xy;
  vec2 slices = textureLod(uNoise, (uv + 0.5) / NOISE_SIZE, 0.0).rg;
  return mix(slices.r, slices.g, f.z);
}

// Hash sem seno (Dave Hoskins): estável entre GPUs
vec4 hash42(vec2 p) {
  vec4 p4 = fract(vec4(p.xyxy) * vec4(0.1031, 0.1030, 0.0973, 0.1099));
  p4 += dot(p4, p4.wzxy + 33.33);
  return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}
