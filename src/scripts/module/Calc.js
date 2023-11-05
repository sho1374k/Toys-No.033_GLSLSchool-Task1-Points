export class Calc {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @returns
   */
  static normalizeVectorCoords(x, y, w, h) {
    const coords = {
      x: x - w * 0.5,
      y: h * 0.5 - y,
    };

    return coords;
  }

  /**
   * @param {number} start
   * @param {number} end
   * @param {number} ease
   */
  static lerp(start, end, ease) {
    return start * (1 - ease) + end * ease;
  }

  /**
   * @param {number} num
   * @param {number} min
   * @param {number} max
   */
  static clamp(num, min, max) {
    return min > num ? min : max < num ? max : num;
  }

  /**
   * 範囲を超えると反対の端点にする
   * @param {number} num
   * @param {number} min
   * @param {number} max
   */
  static hoop(num, min, max) {
    const range = max - min + 1;
    let mod = (num - min) % range;
    if (0 > mod) {
      mod = range + mod;
    }
    return mod + min;
  }

  /**
   * @param {number} min
   * @param {number} max
   * @returns
   */
  static clampRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  static rangeRandom(min1, max1, min2, max2) {
    const random1 = this.clampRandom(min1, max1);
    const random2 = this.clampRandom(min2, max2);
    return Math.random() < 0.5 ? random1 : random2;
    //  Math.floor(Math.random() * (b - a + 1)) + a;

    // cからdまでのランダムな整数を生成
    // const randomCD = Math.floor(Math.random() * (d - c + 1)) + c;

    // randomABとrandomCDの中からランダムに1つを選択
    // const randomResult = Math.random() < 0.5 ? randomAB : randomCD;

    // return randomResult;
  }


  /**
   * @param {number} value
   * @param {number} start1
   * @param {number} stop1
   * @param {number} start2
   * @param {number} stop2
   */
  static map(value, start1, stop1, start2, stop2) {
    return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  }

  /**
   * 度数からラジアンに変換
   * @param {number} degree // 度数
   * @returns 弧度法のラジアンを返す
   */
  static degreeToRadian(degree) {
    const radian = (degree * Math.PI) / 180;
    return radian;
  }

  /**
   * ラジアンから度数に変換
   * @param {number} radians // 角度
   * @returns 弧度法のラジアンを返す
   */
  static radianToDegree(radian) {
    const degree = (radian * 180) / Math.PI;
    return degree;
  }
}
