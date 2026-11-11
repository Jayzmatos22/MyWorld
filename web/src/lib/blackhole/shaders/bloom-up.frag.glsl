// ── Bloom, subida ───────────────────────────────────────────────────────────
// Amplia o nível menor com um filtro em tenda (8 leituras) e SOMA ao nível maior
// (mistura aditiva feita pela GPU). No fim, o nível 0 acumula todos os raios de brilho.
in vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uTexel;
out vec4 outColor;

void main() {
  vec3 c = texture(uSource, vUv + uTexel * vec2(-2.0, 0.0)).rgb;
  c += texture(uSource, vUv + uTexel * vec2(2.0, 0.0)).rgb;
  c += texture(uSource, vUv + uTexel * vec2(0.0, -2.0)).rgb;
  c += texture(uSource, vUv + uTexel * vec2(0.0, 2.0)).rgb;
  vec3 d = texture(uSource, vUv + uTexel * vec2(-1.0, 1.0)).rgb;
  d += texture(uSource, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  d += texture(uSource, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  d += texture(uSource, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  outColor = vec4((c + 2.0 * d) / 12.0, 1.0);
}
