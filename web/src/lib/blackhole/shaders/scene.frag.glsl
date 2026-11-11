// ── Cena: um raio por pixel ─────────────────────────────────────────────────
uniform vec2 uCenter; // centro do buraco negro, em pixels do alvo
uniform mat3 uCam;    // colunas: direita, cima, frente
uniform vec3 uCamPos;

out vec4 outColor;

// A borda da sombra é um degrau duro (o raio cai ou escapa), então serrilha. Num anel
// fino em volta do parâmetro de impacto crítico (3√3/2 ≈ 2,6), cada pixel traça 4 raios
// em grade rotacionada. Isso atinge cerca de 1% dos pixels: antisserrilhado quase de graça.
const float EDGE_CENTER = 2.55;
const float EDGE_BAND = 0.3;
const vec2 EDGE_SAMPLES[4] = vec2[4](
  vec2(-0.125, -0.375),
  vec2(0.375, -0.125),
  vec2(-0.375, 0.125),
  vec2(0.125, 0.375)
);

vec3 rayThrough(vec2 pixel) {
  return normalize(uCam * vec3(pixel * uPixelAngle, 1.0));
}

void main() {
  vec2 pixel = gl_FragCoord.xy - uCenter;
  vec3 dir = rayThrough(pixel);
  float impact = length(cross(uCamPos, dir));

  if (abs(impact - EDGE_CENTER) < EDGE_BAND) {
    vec4 sum = vec4(0.0);
    for (int i = 0; i < 4; i++) sum += traceRay(uCamPos, rayThrough(pixel + EDGE_SAMPLES[i]));
    outColor = sum * 0.25;
  } else {
    outColor = traceRay(uCamPos, dir);
  }
}
