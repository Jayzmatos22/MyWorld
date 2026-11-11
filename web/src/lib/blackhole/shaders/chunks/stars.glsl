// ── Estrelas de fundo ───────────────────────────────────────────────────────
// Recebem a direção FINAL do raio, já curvada pela gravidade. Por isso, perto da sombra,
// as estrelas se esticam em arcos e desenham um anel de Einstein sutil.
uniform vec2 uStars; // densidade, brilho

vec3 starLayer(vec2 sky, float cellsPerRadian, float chance, float layerSeed) {
  vec2 grid = sky * cellsPerRadian;
  vec4 rnd = hash42(floor(grid) + layerSeed);
  if (rnd.x > chance) return vec3(0.0);

  vec2 local = fract(grid) - 0.5 - (rnd.yz - 0.5) * 0.7;
  // Nunca menor que ~1 pixel do alvo: estrela subpixel cintila ao mover a câmera
  float size = max(mix(0.035, 0.085, rnd.w * rnd.w), 1.3 * uPixelAngle * cellsPerRadian);
  float core = smoothstep(size, 0.0, length(local));
  float twinkle = 0.78 + 0.22 * sin(uTime * (0.6 + 2.2 * rnd.w) + rnd.y * 44.0);

  // Mesmos tons do campo de estrelas do site: frio, azulado e quente
  vec3 tint = mix(vec3(0.74, 0.79, 1.0), vec3(1.0, 0.86, 0.66), step(0.7, rnd.z));
  tint = mix(tint, vec3(0.9, 0.92, 1.0), step(rnd.z, 0.35));
  return tint * (core * core * (0.35 + 1.9 * rnd.w * rnd.w) * twinkle);
}

vec3 starField(vec3 direction) {
  // Céu em longitude/latitude; a câmera olha para perto do equador, longe dos polos
  vec2 sky = vec2(atan(direction.z, direction.x), asin(clamp(direction.y, -1.0, 1.0)));
  vec3 stars = starLayer(sky, 70.0, 0.1 * uStars.x, 0.0) + starLayer(sky, 150.0, 0.06 * uStars.x, 57.0);
  return stars * uStars.y;
}
