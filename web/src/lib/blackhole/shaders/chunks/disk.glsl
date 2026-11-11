// ── Disco de acreção ────────────────────────────────────────────────────────
uniform float uDiskIn;
uniform float uDiskOut;
uniform float uDiskSpeed; // velocidade angular na borda interna (rad/s)
uniform float uSpin;      // sentido da órbita (+1 ou −1)
uniform vec4 uFlow;       // xy: idade de cada camada de turbulência (s); z: peso da primeira
uniform vec2 uFlowSeed;
uniform vec4 uDiskShape;  // opacidade, intensidade, queda, turbulência
uniform vec3 uDiskNoise;  // warp, células por volta, células por rs
uniform vec3 uColorHot;
uniform vec3 uColorWarm;
uniform vec3 uColorCool;
uniform vec2 uDoppler;    // força, expoente
uniform float uBreath;

const int OCTAVES = 4;
const float TAU = 6.2831853;

// Turbulência de UMA camada, centrada em zero. O ruído é amostrado num cilindro
// (cos φ, sin φ, r): fecha a volta sem emenda e permite frequências diferentes ao longo
// da órbita e no raio, o que já nasce como filamento alongado.
float diskLayer(vec2 dir, float r, float age, float seed, float footprint) {
  // Rotação diferencial kepleriana: ω ∝ r^-3/2. O interior ultrapassa o exterior, e o
  // próprio cisalhamento estica os filamentos ao longo da órbita.
  float omega = uDiskSpeed * pow(uDiskIn / r, 1.5);
  float turn = uSpin * omega * age;
  float c = cos(turn);
  float s = sin(turn);
  vec2 d = vec2(dir.x * c + dir.y * s, dir.y * c - dir.x * s); // direção em φ − ω·t

  // Quanto o cisalhamento já comprimiu o padrão no sentido radial: dφ/dr = 1,5·ω·t / r
  float shear = 1.5 * omega * age / r;
  float cylinder = uDiskNoise.y / TAU; // raio do cilindro que dá N células por volta
  float radial = uDiskNoise.z;

  // Domain warping: um ruído grosso desloca a amostra e quebra a regularidade do FBM
  float bend = noise3(vec3(d * cylinder * 0.5, r * radial * 0.5 + seed)) - 0.5;
  vec3 base = vec3(d * cylinder, r * radial) + uDiskNoise.x * bend * vec3(0.9, -0.6, 1.4);

  float sum = 0.0;
  float total = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < OCTAVES; i++) {
    // Limite de banda: a oitava some quando seu detalhe fica menor que um pixel.
    // Sem isso, o cisalhamento acumulado viraria cintilação.
    float cellsPerRs = frequency * (radial + cylinder * shear);
    float visible = 1.0 - smoothstep(0.3, 0.7, cellsPerRs * footprint);
    sum += amplitude * visible * (noise3(base * frequency + seed) - 0.5);
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return sum / total;
}

// Duas camadas defasadas em meio ciclo: cada uma renasce (com outra semente) quando seu
// peso é zero. O gás gira para sempre sem que o cisalhamento cresça sem limite.
float diskTurbulence(vec2 xz, float r, float footprint) {
  vec2 dir = xz / r;
  float w1 = uFlow.z;
  float w2 = 1.0 - w1;
  float n = w1 * diskLayer(dir, r, uFlow.x, uFlowSeed.x, footprint)
          + w2 * diskLayer(dir, r, uFlow.y, uFlowSeed.y, footprint);
  // Somar dois ruídos independentes reduz o contraste no meio da troca; dividir pela
  // norma dos pesos mantém a variância constante (sem "respiração" artificial)
  n *= inversesqrt(w1 * w1 + w2 * w2);
  return clamp(0.5 + 1.6 * n, 0.0, 1.0);
}

// Luz emitida (rgb, HDR) e opacidade (a) do disco no ponto em que o raio o atravessa
vec4 shadeDisk(vec3 hit, float r, vec3 rayDir, float footprint) {
  float n = diskTurbulence(hit.xz, r, footprint);

  // Borda interna nítida (abaixo da ISCO o gás cai sem orbitar) e externa que se desfaz
  float inner = smoothstep(uDiskIn, uDiskIn * 1.12, r);
  float outer = 1.0 - smoothstep(uDiskOut * 0.55, uDiskOut, r);
  float lanes = mix(1.0, smoothstep(0.18, 0.78, n), uDiskShape.w);
  float density = inner * outer * lanes;

  // Disco fino: a temperatura cai com T ∝ r^-3/4
  float temperature = pow(uDiskIn / r, 0.75);

  // Doppler relativístico. O gás orbita com β = v/c = √(1 / (2(r − 1))): 0,5c na ISCO.
  // g = 1 / (γ·(1 − β·cos θ)), com θ entre a velocidade do gás e o fóton que chega à câmera.
  float beta = min(uDoppler.x * sqrt(0.5 / max(r - 1.0, 0.6)), 0.95);
  vec3 orbit = uSpin * normalize(vec3(-hit.z, 0.0, hit.x));
  float cosTheta = dot(orbit, -rayDir); // o fóton viaja no sentido contrário ao do raio traçado
  float g = sqrt(1.0 - beta * beta) / (1.0 - beta * cosTheta);
  // Desvio para o vermelho gravitacional: a luz perde energia ao sair do poço
  g *= sqrt(1.0 - 1.0 / r);

  // A cor segue a temperatura OBSERVADA (T·g): o lado que se aproxima fica mais branco,
  // o que se afasta fica mais vermelho e escuro
  float observed = temperature * g;
  vec3 color = mix(uColorCool, uColorWarm, smoothstep(0.22, 0.62, observed));
  color = mix(color, uColorHot, smoothstep(0.6, 1.15, observed));

  // Beaming: a intensidade observada escala com g³
  float intensity = uDiskShape.y * pow(temperature, uDiskShape.z) * pow(g, uDoppler.y) * uBreath;
  float emission = density * (0.3 + 1.5 * n * n); // filamentos densos brilham mais
  float alpha = clamp(density * uDiskShape.x, 0.0, 1.0);
  return vec4(color * (intensity * emission), alpha);
}
