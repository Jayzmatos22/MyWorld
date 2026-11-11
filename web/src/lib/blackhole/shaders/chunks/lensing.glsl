// ── Lente gravitacional ─────────────────────────────────────────────────────
//
// Perto de um buraco negro de Schwarzschild, a luz segue geodésicas nulas. Em coordenadas
// cartesianas e com rs = 1, a trajetória obedece exatamente a
//
//     d²x/dλ² = −(3/2) · h² · x / r⁵        h = |x × v|  (momento angular, constante)
//
// que é a equação de Binet u″ + u = (3/2)·u² em forma vetorial. Cada passo custa o mesmo
// que uma gravidade newtoniana, mas a sombra sai no raio certo (3√3/2 rs) e a luz dá
// voltas na esfera de fótons (r = 1,5): é isso que desenha o anel fino na borda e faz a
// parte de trás do disco aparecer por cima e por baixo da sombra.
uniform int uSteps;
uniform float uStepScale;
uniform float uPhotonRing;
uniform vec2 uCover; // parâmetros de impacto entre os quais o céu do site reaparece

const int MAX_STEPS = 96;
const float HORIZON = 1.02;
const float FAR_MARGIN = 4.0;

vec3 lightAcceleration(vec3 x, float h2) {
  float r2 = dot(x, x);
  return -1.5 * h2 * x / (r2 * r2 * sqrt(r2));
}

// Segue um raio de luz de trás para frente (da câmera para a cena). Devolve a luz HDR em
// rgb e, em a, quanto do céu do site este pixel deve esconder.
vec4 traceRay(vec3 origin, vec3 dir) {
  vec3 angular = cross(origin, dir);
  float h2 = dot(angular, angular);
  float impact = sqrt(h2); // distância a que o raio passaria do centro se não houvesse gravidade

  // Raio que nunca chega perto do disco: nada do shader aparece neste pixel
  if (impact > uDiskOut + 1.0) return vec4(0.0);

  // Pula o caminho vazio até a esfera que envolve o disco (fora dela a curvatura é mínima)
  float far = uDiskOut + FAR_MARGIN;
  float entry = -dot(origin, dir) - sqrt(max(far * far - h2, 0.0));
  vec3 x = origin + dir * max(entry, 0.0);
  vec3 v = dir;
  vec3 a = lightAcceleration(x, h2);

  vec3 light = vec3(0.0);
  float transmittance = 1.0;
  float closest = 1e9;
  bool escaped = false;
  bool captured = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    if (i >= uSteps) break;
    float r = length(x);
    closest = min(closest, r);
    if (r < HORIZON) {
      captured = true; // caiu no horizonte de eventos
      break;
    }
    if (r > far && dot(x, v) > 0.0) {
      escaped = true; // saiu da região curva: o resto do caminho é reto
      break;
    }

    // Passo proporcional ao raio: curto onde a curvatura é forte, longo no vazio
    float dt = max(r * uStepScale, 0.02);

    // Leapfrog (kick, drift, kick): conserva bem a órbita com uma aceleração por passo
    vec3 vHalf = v + a * (0.5 * dt);
    vec3 xNext = x + vHalf * dt;
    vec3 aNext = lightAcceleration(xNext, h2);
    vec3 vNext = vHalf + aNext * (0.5 * dt);

    // O raio cruzou o plano do disco (y = 0) neste passo? Um mesmo raio pode cruzar mais
    // de uma vez: a segunda travessia é a imagem da parte de trás, dobrada pela lente.
    if (x.y * xNext.y < 0.0) {
      float t = x.y / (x.y - xNext.y);
      vec3 hit = mix(x, xNext, t);
      float rHit = length(hit.xz);
      if (rHit > uDiskIn && rHit < uDiskOut) {
        vec3 rayDir = normalize(mix(v, vNext, t));
        // Tamanho de um pixel sobre o disco: cresce quando o raio chega rasante
        float footprint = uPixelAngle * distance(hit, origin) / max(abs(rayDir.y), 0.12);
        vec4 disk = shadeDisk(hit, rHit, rayDir, footprint);
        light += transmittance * disk.rgb;
        transmittance *= 1.0 - disk.a;
        if (transmittance < 0.02) break; // disco opaco: o que vem atrás não chega à câmera
      }
    }

    x = xNext;
    v = vNext;
    a = aNext;
  }

  float cover = 1.0 - smoothstep(uCover.x, uCover.y, impact);
  if (escaped) light += transmittance * cover * starField(normalize(v));
  if (!captured) {
    // Anel de fótons: luz de raios que quase entraram em órbita em r = 1,5. Vale também
    // para os que ficaram sem passos dando voltas ali; tratá-los como pretos deixaria a
    // borda da sombra serrilhada.
    light += transmittance * uPhotonRing * exp(-7.0 * abs(closest - 1.5)) * uColorHot * uBreath;
  }
  return vec4(light, max(cover, 1.0 - transmittance));
}
