import GUI from "lil-gui";

export class Gui {
  constructor() {
    this.gui = null;
    window.GUI = null;

    if (window.MODE) {
      this.gui = new GUI();
      window.GUI = this.gui;
      this.toOpen();
    }
  }

  toOpen() {
    if (this.gui != null) this.gui.open();
  }

  toClose() {
    if (this.gui != null) this.gui.close();
  }
}
