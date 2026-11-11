// ── Composição final ────────────────────────────────────────────────────────
in vec2 vUv;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec2 uCenterUv;
uniform vec4 uPost; // exposição, bloom, grão, aberração cromática
uniform vec2 uFade; // margens de baixo e de cima em que a imagem se dissolve
uniform float uTime;
out vec4 outColor;

void main() {
  // Aberração cromática: vermelho e azul lidos em posições opostas, crescendo com o
  // quadrado da distância ao buraco, como numa lente de vidro
  vec2 away = vUv - uCenterUv;
  vec2 shift = away * dot(away, away) * uPost.w;
  vec4 scene = texture(uScene, vUv);
  vec3 color = vec3(texture(uScene, vUv + shift).r, scene.g, texture(uScene, vUv - shift).b);

  color += texture(uBloom, vUv).rgb * uPost.y;
  color = acesTonemap(color * uPost.x);

  // Grão de filme: proporcional ao brilho (quase nada no preto da sombra) e ausente onde não há imagem
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float grain = grainNoise(gl_FragCoord.xy + fract(uTime * 7.31) * vec2(131.0, 97.0)) - 0.5;
  color += grain * uPost.z * (0.03 + luma) * max(scene.a, smoothstep(0.0, 0.04, luma));

  color = linearToSrgb(max(color, 0.0));

  // Alfa pré-multiplicado: onde a = 1 o shader esconde o céu do site (sombra, disco);
  // onde a = 0 a luz é simplesmente somada à página
  float fade = smoothstep(0.0, uFade.x, vUv.y) * smoothstep(0.0, uFade.y, 1.0 - vUv.y);
  outColor = vec4(color, scene.a) * fade;
}
