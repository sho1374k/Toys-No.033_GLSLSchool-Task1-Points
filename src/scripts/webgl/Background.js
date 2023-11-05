import { WebGLUtility, ShaderProgram } from "./lib/doxas.js";
import { Params, Type } from "../Variables";
import { Color } from "./moudle/Utils";
import { GetPlaneGeometry } from "./moudle/GetPlaneGeometry";
import backgroundFragmentShader from "../../shaders/frag/background.glsl";
import backgroundVertexShader from "../../shaders/vert/background.glsl";

export class Background {
  constructor(_gl) {
    this.gl = _gl;
    this.canvas = this.gl.canvas;
    this.params = Params;
    this.isAbleToRender = false;

    this.geometry = {
      position: null,
      uv: null,
      normal: null,
      index: null,
      length: null,
      ibo: {
        buffer: null,
        length: null,
      },
    };

    this.uniforms = {
      uTime: 0,
      uColor1: Color.hexToGlslColor("#290000", 1.0),
      uColor2: Color.hexToGlslColor("#aa6d22", 1.0),
      uResolution: [this.params.w, this.params.h],
    };
  }

  createPlaneGeometry(_widthSegments = 1, _heightSegments = 1) {
    const g = GetPlaneGeometry(2, 2, _widthSegments, _heightSegments);

    this.geometry.position = g.position;
    this.geometry.uv = g.uv;
    this.geometry.normal = g.normal;
    this.geometry.ibo.buffer = WebGLUtility.createIbo(this.gl, g.index);
    this.geometry.ibo.length = g.index.length;

    this.vbo = [
      WebGLUtility.createVbo(this.gl, this.geometry.position),
      WebGLUtility.createVbo(this.gl, this.geometry.uv),
      WebGLUtility.createVbo(this.gl, this.geometry.normal),
    ];
  }

  resize(_params) {
    this.params = _params;
    this.uniforms.uResolution[0] = this.params.w;
    this.uniforms.uResolution[1] = this.params.h;
  }

  render(_time) {
    if (this.isAbleToRender) {
      const gl = this.gl;
      this.uniforms.uTime = _time;

      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      this.shaderProgram.use();
      this.shaderProgram.setAttribute(this.vbo);

      this.shaderProgram.setUniform([
        this.uniforms.uTime,
        this.uniforms.uColor1,
        this.uniforms.uColor2,
        this.uniforms.uResolution,
      ]);

      gl.drawElements(gl.TRIANGLES, this.geometry.ibo.length, gl.UNSIGNED_SHORT, 0);
    }
  }

  debug() {
    if (GUI != null) {
      const folder = GUI.addFolder("background");
      // folder.close();
      folder
        .addColor(this.uniforms, "uColor1")
        .name("color1")
        .onChange((value) => {});
      folder
        .addColor(this.uniforms, "uColor2")
        .name("color2")
        .onChange((value) => {});
    }
  }

  init() {
    console.log("🚀 ~ Background init");
    return new Promise((resolve) => {
      this.shaderProgram = new ShaderProgram(this.gl, {
        vertexShaderSource: backgroundVertexShader,
        fragmentShaderSource: backgroundFragmentShader,
        // prettier-ignore
        attribute: [
          "position",
          "uv",
          "normal",
        ],
        // prettier-ignore
        stride: [
          3,
          2,
          3,
        ],
        // prettier-ignore
        uniform: [
          "uTime",
          "uColor1",
          "uColor2",
          "uResolution",
        ],
        // prettier-ignore
        type: [
          Type.f,
          Type.v4,
          Type.v4,
          Type.v2,
        ],
      });

      this.createPlaneGeometry();
      this.debug();
      this.isAbleToRender = true;
      resolve();
    });
  }
}
