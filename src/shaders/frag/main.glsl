precision mediump float;
varying float vEnableParticle;
varying float vDisableParticle;
uniform vec4 uColor;
uniform vec4 uParticleColor;
uniform sampler2D uParticleTexture;

void main() {
  vec4 particle, color, dist;

  particle = texture2D(uParticleTexture, gl_PointCoord);
  particle = particle * uParticleColor;

  color = uColor;
  color.a = 0.1;

  vec3 n;
  n.xy = gl_PointCoord * 2.0 - 1.0;
  n.z = 1.0 - dot(n.xy, n.xy);
  if (n.z < 0.0) discard;

  dist = color * vDisableParticle + particle * vEnableParticle;
  gl_FragColor = dist;
}