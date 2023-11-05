attribute vec3 position;
attribute vec3 aMovePos;
attribute vec4 aRand;
attribute float aPointSize;

varying float vEnableParticle;
varying float vDisableParticle;

uniform float uTime;
uniform float uFreq;
uniform vec2 uPointer;
uniform vec2 uResolution;

#include '../_inc/PI.glsl';
#include '../_inc/simplex3d.glsl';
#include '../_inc/rotateZ.glsl';
#include '../_inc/translate.glsl';

void main() {
  vec2 toMouse = uPointer - position.xy;
  float distanceToMouse = length(toMouse);

  float t = uTime,
        random = aRand.x,
        scale = 1.0 + sin(t * random),
        enableEffects = aRand.y,
        enableRotate = aRand.z,
        enableParticle = aRand.w,
        disableParticle = 1.0 - enableParticle,
        aspect = uResolution.x / uResolution.y;

  vec3 distPos,
       pos = position,
       diffPos = aMovePos,
       particlePos = position;

  diffPos.y = diffPos.y + snoise(
    vec3(
      diffPos.x + t * 1.0,
      diffPos.y + t * 2.0,
      diffPos.z + t * 3.0
    )
  ) * 1.0 * enableEffects;
  diffPos = diffPos - position;

  pos = pos + diffPos * uFreq * random *  enableEffects;
  // pos = pos + diffPos * random *  enableEffects; // debug
  pos *= rotateZ((t * 1.0 + (t * uFreq) * enableEffects) * enableRotate);
  pos.y *= aspect;

  particlePos.y *= aspect;
  particlePos.xy += translate(
    particlePos.xy,
    vec2(random * 10.0, random * -10.0),
    clamp(random, 0.2, 1.0),
    random * 2.0
  );

  distPos = pos * disableParticle + particlePos * enableParticle;
  gl_Position = vec4(distPos, 1.0);

  gl_PointSize = abs((aPointSize * 1.2) * disableParticle + (aPointSize * scale * distanceToMouse) * enableParticle);

  vEnableParticle = enableParticle;
  vDisableParticle = disableParticle;
}
