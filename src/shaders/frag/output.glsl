precision mediump float;
varying vec2 vUv;

uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uDeviation;

const int RADIUS = 1;

#include "../_inc/PI.glsl";

void main() {
  float blurSize = 0.25;
  vec2 pixelStep = 1.0 / vec2(uResolution.x * blurSize, uResolution.y * blurSize);

  float x2, y2, deviation, w, weightSum = 0.0;
  vec2 stepVec2, uv;
  vec3 color = vec3(0.0);
  for (int x = -RADIUS; x <= RADIUS; ++x) {
    for (int y = -RADIUS; y <= RADIUS; ++y) {
      stepVec2 = vec2(x, y);
      x2 = pow(stepVec2.x, 2.0);
      y2 = pow(stepVec2.y, 2.0);
      deviation = pow(uDeviation, 2.0);
      w = (1.0 / (2.0 * PI * deviation)) * exp(-(x2 + y2) / (2.0 * deviation));
      uv = vUv + stepVec2 * pixelStep;
      color += texture2D(uTexture, uv).rgb * w;
      weightSum += w;
    }
  }

  vec4 gaussblur = vec4(color / weightSum, 1.0);
  vec4 prev = texture2D(uTexture, vUv);
  vec4 post = prev * 1.0 + gaussblur;
  float enablePost = step(0.0001, uDeviation);
  vec4 dist = post * enablePost + prev * (1.0 - enablePost);

  gl_FragColor = dist;
}