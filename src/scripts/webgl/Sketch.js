import { Params, UpdateParams, BREAK_POINT } from "../Variables";
import { World } from "./World";
import { Background } from "./Background";
import { PostProcess } from "./PostProcess";
import { AudioSystem } from "../module/AudioSystem";

export class Sketch {
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.params = Params;
    UpdateParams();

    this.isAbleToRender = false;
  
    this.timer = {
      resize: null,
    };

    this.pointer = { x: 0, y: 0 };

    this.progress = {
      time: 0,
      freq: 0,
    };

    this.canvas = document.getElementById("world");
    this.gl = this.canvas.getContext("webgl");

    this.world = new World(this.gl);
    this.background = new Background(this.gl);
    this.pp = new PostProcess(this.gl);

    this.audio = new AudioSystem();
    this.audio.init();

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
  }

  render() {
    if (this.isAbleToRender) {
      const gl = this.gl;
      this.progress.time = performance.now() * 0.001;
      this.progress.freq = this.audio.getScale();

      this.pp.ableFrameBuffer();

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // gl.ONE
      gl.enable(gl.BLEND);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      this.background.render(this.progress.time);
      this.world.render(this.progress.time, this.progress.freq);
      this.pp.render(this.progress.time);
    }
  }

  onPointerMove(e) {
    this.pointer.x = (e.clientX / this.params.w) * 2.0 - 1.0;
    this.pointer.y = ((e.clientY / this.params.h) * 2.0 - 1.0) * -1;
    this.world.onPointerMove(this.pointer.x, this.pointer.y);
  }

  resize() {
    this.params = Params;
    UpdateParams();

    this.canvas.width = this.params.w;
    this.canvas.height = this.params.h;

    this.world.resize(this.params);
    this.background.resize(this.params);
    this.pp.resize(this.params);

    this.resizeAfter();
  }

  resizeAfter() {
    clearTimeout(this.timer.resize);
    this.timer.resize = setTimeout(() => {
      const threshold = () => {
        const w = window.innerWidth;
        if (w > BREAK_POINT) {
          if (this.params.beforeWidth < BREAK_POINT + 1) window.location.reload();
        }
        if (w < BREAK_POINT + 1) {
          if (this.params.beforeWidth > BREAK_POINT + 1) window.location.reload();
        }
        this.params.beforeWidth = w;
      };
      threshold();
    });
  }

  init() {
    console.log("🎨 ~ Sketch init");
    return new Promise((resolve) => {
      !(async () => {
        await this.world.init();
        await this.background.init();
        await this.pp.init();
        this.isAbleToRender = true;
        resolve();
      })();
    });
  }
}
