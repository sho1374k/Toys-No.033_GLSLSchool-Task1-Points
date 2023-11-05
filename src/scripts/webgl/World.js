import { WebGLUtility, ShaderProgram } from "./lib/doxas.js";
import { Params, Type } from "../Variables";
import { Color } from "./moudle/Utils";
import { Calc } from "../module/Calc";
import fragmentShader from "../../shaders/frag/main.glsl";
import vertexShader from "../../shaders/vert/main.glsl";

export class World {
  constructor(_gl) {
    this.gl = _gl;
    this.canvas = this.gl.canvas;
    this.params = Params;
    this.isAbleToRender = false;

    this.geometry = {
      position: [],
      aMovePos: [],
      aRand: [
        /*
          【 vec4の中身 】
          x: ユニークなランダム値として使用する
          y: オーディオ連動等のエッフェクト真偽値として使用する
          z: 回転の向きを設定するために使用する
          w: パーティクルの真偽値として使用する
        */
      ],
      aPointSize: [],
    };

    this.uniforms = {
      uTime: 0.0,
      uFreq: 0.0,
      uResolution: [this.params.w, this.params.h],
      uPointer: [0.0, 0.0],
      uColor: Color.hexToGlslColor("#fff", 1.0),
      uParticleColor: Color.hexToGlslColor("#ff8800", 1.0),
      uParticleTexture: null,
    };
  }

  getWaveRangeValue(_value, _min, _max) {
    const diff = _max - _min;
    const center = _min + diff * 0.5;

    if (_value < center) {
      return Calc.map(_value, _min, center, 0, 1);
    } else {
      return Calc.map(_value, center, _max, 1, 0);
    }
  }

  createGeometry() {
    const BASE_DEGREE = 72,
      POWER = 1;
    const rangeDegreeList = [
      {
        min: BASE_DEGREE * 0 + 1,
        max: BASE_DEGREE * 1,
        power: 0.175 * POWER,
      },
      {
        min: BASE_DEGREE * 1 + 1,
        max: BASE_DEGREE * 2,
        power: 0.2 * POWER,
      },
      {
        min: BASE_DEGREE * 2 + 1,
        max: BASE_DEGREE * 3,
        power: 0.15 * POWER,
      },
      {
        min: BASE_DEGREE * 3 + 1,
        max: BASE_DEGREE * 4,
        power: 0.175 * POWER,
      },
      {
        min: BASE_DEGREE * 4 + 1,
        max: BASE_DEGREE * 5,
        power: 0.2 * POWER,
      },
    ];

    const COUNT1 = 360 * 2,
      COUNT2 = 360,
      COUNT3 = 721,
      COUNT4 = 2,
      COUNT = COUNT1 + COUNT2 + COUNT3 + COUNT4;

    const RADIAN = ((360 / 360) * Math.PI) / 180.0,
      RADIUS = this.params.isMatchMediaWidth ? 0.8 : 0.4,
      DEGREE_OF_PI = 180 / 360,
      PI2 = Math.PI * 2;

    const POINT_SIZE1 = 4.0,
      POINT_SIZE2 = this.params.isMatchMediaWidth ? 4.0 : 8.0,
      POINT_SIZE3 = 4.0,
      POINT_SIZE4 = this.params.isMatchMediaWidth ? 6.0 : 8.0;

    const enableEffects = 1,
      disableEffects = 0,
      enableParticle = 1,
      disableParticle = 0,
      rotateDirection1 = 1,
      rotateDirection2 = -0.5,
      rotateDirection3 = 0;

    let x, y, tmp, deg, radian, angle, randomRadius;

    for (let i = 0; i < COUNT; ++i) {
      for (let j = 0; j < COUNT; ++j) {
        // 外側の円
        if (j <= COUNT1) {
          x = Math.cos(RADIAN * j) * RADIUS;
          y = Math.sin(RADIAN * j) * RADIUS;

          this.geometry.position.push(x, y, 0.0);
          this.geometry.aPointSize.push(POINT_SIZE1);
          this.geometry.aMovePos.push(
            Math.cos(RADIAN * j) * RADIUS * 1.5 * 1.5,
            Math.sin(RADIAN * j) * RADIUS * 1.5 * 1.5,
            0,
          );

          deg = (RADIAN * j * 180) / Math.PI;
          if (deg > rangeDegreeList[0].min && deg < rangeDegreeList[0].max) {
            tmp = this.getWaveRangeValue(deg, rangeDegreeList[0].min, rangeDegreeList[0].max);
            // prettier-ignore
            this.geometry.aRand.push(
              Calc.clampRandom(0, tmp) * rangeDegreeList[0].power, 
              enableEffects, 
              rotateDirection1, 
              disableParticle
            );
          } else if (deg > rangeDegreeList[1].min && deg < rangeDegreeList[1].max) {
            tmp = this.getWaveRangeValue(deg, rangeDegreeList[1].min, rangeDegreeList[1].max);
            // prettier-ignore
            this.geometry.aRand.push(
              Calc.clampRandom(0, tmp) * rangeDegreeList[1].power, 
              enableEffects, 
              rotateDirection1,
              disableParticle
            );
          } else if (deg > rangeDegreeList[2].min && deg < rangeDegreeList[2].max) {
            tmp = this.getWaveRangeValue(deg, rangeDegreeList[2].min, rangeDegreeList[2].max);
            // prettier-ignore
            this.geometry.aRand.push(
              Calc.clampRandom(0, tmp) * rangeDegreeList[2].power, 
              enableEffects, 
              rotateDirection1,
              disableParticle
            );
          } else if (deg > rangeDegreeList[3].min && deg < rangeDegreeList[3].max) {
            tmp = this.getWaveRangeValue(deg, rangeDegreeList[3].min, rangeDegreeList[3].max);
            // prettier-ignore
            this.geometry.aRand.push(
              Calc.clampRandom(0, tmp) * rangeDegreeList[3].power, 
              enableEffects, 
              rotateDirection1,
              disableParticle
            );
          } else if (deg > rangeDegreeList[4].min && deg < rangeDegreeList[4].max) {
            tmp = this.getWaveRangeValue(deg, rangeDegreeList[4].min, rangeDegreeList[4].max);
            // prettier-ignore
            this.geometry.aRand.push(
              Calc.clampRandom(0, tmp) * rangeDegreeList[4].power, 
              enableEffects, 
              rotateDirection1,
              disableParticle
            );
          } else {
            // prettier-ignore
            this.geometry.aRand.push(
              Calc.clampRandom(0, 0.5) * 0.1 * 4, 
              enableEffects,
              rotateDirection1,
              disableParticle
            );
          }
        }
        // 半円
        else if (j <= COUNT1 + COUNT2) {
          radian = (DEGREE_OF_PI * Math.PI) / 180.0;
          x = Math.cos(radian * j) * RADIUS * 0.9;
          y = Math.sin(radian * j) * RADIUS * 0.9;

          this.geometry.position.push(x, y, 0.0);
          this.geometry.aPointSize.push(POINT_SIZE2);
          this.geometry.aMovePos.push(x, y, 0);
          // prettier-ignore
          this.geometry.aRand.push(
            1, 
            disableEffects, 
            rotateDirection2, 
            disableParticle
          );
        }
        // 中心の円
        else if (j <= COUNT1 + COUNT2 + COUNT3) {
          radian = (DEGREE_OF_PI * Math.PI) / 180.0;
          x = Math.cos(radian * j) * RADIUS * 0.8;
          y = Math.sin(radian * j) * RADIUS * 0.8;
          this.geometry.position.push(x, y, 0.0);
          this.geometry.aPointSize.push(POINT_SIZE3);

          // prettier-ignore
          this.geometry.aMovePos.push(
            Math.cos(RADIAN * j) * RADIUS * 0.7,
            Math.sin(RADIAN * j) * RADIUS * 0.7,
            0
          );
          // prettier-ignore
          this.geometry.aRand.push(
            Calc.clampRandom(0, 1) * 0.1,
            enableEffects, 
            rotateDirection1, 
            disableParticle
          );
        }
        // パーティクル
        else if (j <= COUNT1 + COUNT2 + COUNT3 + COUNT4) {
          // 指定した半径の外側にランダムな座標を極座標で取得し直交座標に変換する
          angle = Math.random() * PI2;
          randomRadius = RADIUS * 1.2 + Math.random() * 8;
          x = randomRadius * Math.cos(angle);
          y = randomRadius * Math.sin(angle);

          this.geometry.position.push(x, y, 0.0);
          this.geometry.aPointSize.push(POINT_SIZE4 * Calc.clampRandom(0.5, 1));
          this.geometry.aMovePos.push(x, y, 0);
          this.geometry.aRand.push(
            Calc.clampRandom(-1, 1) * 0.1,
            Calc.clampRandom(-1, 1) * 0.1,
            rotateDirection3,
            enableParticle,
          );
        }
      }
    }

    this.vbo = [
      WebGLUtility.createVbo(this.gl, this.geometry.position),
      WebGLUtility.createVbo(this.gl, this.geometry.aMovePos),
      WebGLUtility.createVbo(this.gl, this.geometry.aRand),
      WebGLUtility.createVbo(this.gl, this.geometry.aPointSize),
    ];
  }

  onPointerMove(_x, _y) {
    this.uniforms.uPointer[0] = _x;
    this.uniforms.uPointer[1] = _y;
  }

  resize(_params) {
    this.params = _params;
    this.uniforms.uResolution[0] = this.params.w;
    this.uniforms.uResolution[1] = this.params.h;
  }

  render(_time, _freq) {
    if (this.isAbleToRender) {
      const gl = this.gl;

      this.uniforms.uTime = _time;
      this.uniforms.uFreq = _freq;

      this.shaderProgram.use();
      this.shaderProgram.setAttribute(this.vbo);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.uniforms.uParticleTexture);

      this.shaderProgram.setUniform([
        this.uniforms.uTime,
        this.uniforms.uFreq,
        this.uniforms.uResolution,
        this.uniforms.uPointer,
        this.uniforms.uColor,
        this.uniforms.uParticleColor,
        this.uniforms.uParticleTexture,
      ]);

      gl.drawArrays(gl.POINTS, 0, this.geometry.position.length / 3);
    }
  }

  debug() {
    if (GUI != null) {
      const folder = GUI.addFolder("world");
      // folder.close();
      folder
        .addColor(this.uniforms, "uColor")
        .name("obj color")
        .onChange((value) => {});
      folder
        .addColor(this.uniforms, "uParticleColor")
        .name("particle color")
        .onChange((value) => {});
    }
  }

  init() {
    console.log("🚀 ~ World init");
    return new Promise((resolve) => {
      !(async () => {
        this.uniforms.uParticleTexture = await WebGLUtility.createTextureFromFile(this.gl, "assets/img/texture/p.png");

        this.shaderProgram = new ShaderProgram(this.gl, {
          vertexShaderSource: vertexShader,
          fragmentShaderSource: fragmentShader,
          // prettier-ignore
          attribute: [
            "position", 
            "aMovePos",
            "aRand",
            "aPointSize",
          ],
          // prettier-ignore
          stride: [
            3, 
            3,
            4,
            1,
          ],
          // prettier-ignore
          uniform: [
            "uTime",
            "uFreq",
            "uResolution",
            "uPointer", 
            "uColor",
            "uParticleColor",
            "uParticleTexture",
          ],
          // prettier-ignore
          type: [
            Type.f,
            Type.f,
            Type.v2, 
            Type.v2,
            Type.v4, 
            Type.v4, 
            Type.t, 
          ],
        });

        this.createGeometry();
        this.debug();
        this.isAbleToRender = true;
        resolve();
      })();
    });
  }
}
