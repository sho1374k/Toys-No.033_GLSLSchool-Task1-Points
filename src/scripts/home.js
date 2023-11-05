import gsap from "gsap";
import { Sketch } from "./webgl/Sketch";
import { Gui } from "./module/Gui";

window.MODE = process.env.NODE_ENV === "development";
window.addEventListener("DOMContentLoaded", async (e) => {
  const body = document.body;
  // new Gui();
  window.GUI = null;
  const sketch = new Sketch();
  await sketch.init();
  window.addEventListener("resize", sketch.resize);
  window.addEventListener("mousemove", sketch.onPointerMove, { passive: true });
  sketch.resize();
  gsap.ticker.add(sketch.render);
  gsap.ticker.fps(30);

  document.fonts.ready.then((e) => {
    body.setAttribute("data-loaded", "1");

    const entryBtn = document.getElementById("jsEntryBtn");
    entryBtn.addEventListener("click", (e) => {
      body.setAttribute("data-entry", "1");
    });
  });
});
