export class Color {
  /**
   * @param {string} hex // 16進数
   * @returns {Array<number>} [r, g, b]
   */
  static hex2rgb(hex) {
    if (hex.slice(0, 1) === "#") hex = hex.slice(1);
    if (hex.length === 3)
      hex = hex.slice(0, 1) + hex.slice(0, 1) + hex.slice(1, 2) + hex.slice(1, 2) + hex.slice(2, 3) + hex.slice(2, 3);

    return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map(function (str) {
      return parseInt(str, 16);
    });
  }

  /**
   * @param {Array<number>} rgb // [r, g, b] ← hex2rgb
   * @returns {vec3} [r ,g, b]
   */
  static rgbToGLSLColor(rgb) {
    const [r, g, b] = rgb;
    return [r / 255.0, g / 255.0, b / 255.0];
  }

  /**
   * @param {color} hex 16進数
   * @returns {vec4} [r, g, b, a]
   */
  static hexToGlslColor(hex, alpha = 1.0) {
    const vec3 = this.rgbToGLSLColor(this.hex2rgb(hex));
    const vec4 = vec3.concat([alpha]);
    return vec4;
  }

  /**
   * @param {Array<number>} rgb [r, g, b]
   * @returns {string} 
   */
  static glslColorToHex(rgb) {
    // 範囲を 0 ~ 255 へ
    const r = Math.round(rgb[0] * 255);
    const g = Math.round(rgb[1] * 255);
    const b = Math.round(rgb[2] * 255);

    // 16進数に変換
    const rHex = r.toString(16).padStart(2, "0");
    const gHex = g.toString(16).padStart(2, "0");
    const bHex = b.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  }
}
