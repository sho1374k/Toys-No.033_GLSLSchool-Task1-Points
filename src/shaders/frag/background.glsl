precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec4 uColor1;
uniform vec4 uColor2;

#include "../_inc/PI.glsl"
#include "../_inc/rotate.glsl"

void main(){
  vec2 p = gl_FragCoord.xy / uResolution;
  vec2 rp = p * rotate(PI * 0.25);
  vec3 c1 = uColor1.rgb, c2 = uColor2.rgb;
  vec3 color = mix(c1, c2, rp.x);
  gl_FragColor = vec4(color, 1.0);
}