// ── Bloom, descida ──────────────────────────────────────────────────────────
// Cada nível tem metade da resolução do anterior. Borrar em resoluções cada vez menores
// dá um brilho largo por poucos centavos: 5 leituras por pixel em vez de um kernel enorme.
in vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uTexel;     // tamanho de um texel da origem
uniform vec3 uThreshold; // limiar, joelho, 1 = aplicar o limiar (só no primeiro nível)
out vec4 outColor;

void main() {
  vec3 c = texture(uSource, vUv).rgb * 4.0;
  c += texture(uSource, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  c += texture(uSource, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  c += texture(uSource, vUv + uTexel * vec2(-1.0, 1.0)).rgb;
  c += texture(uSource, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  c *= 0.125;

  if (uThreshold.z > 0.5) {
    // Só o que passa do limiar brilha; o joelho suaviza a transição para não recortar
    c = min(c, vec3(64.0)); // segura pixels isolados absurdamente brilhantes
    float brightness = max(c.r, max(c.g, c.b));
    float soft = clamp(brightness - uThreshold.x + uThreshold.y, 0.0, 2.0 * uThreshold.y);
    soft = soft * soft / (4.0 * uThreshold.y + 1e-4);
    c *= max(soft, brightness - uThreshold.x) / max(brightness, 1e-4);
  }
  outColor = vec4(c, 1.0);
}
