module.exports = class Puyo {
  constructor(posX, posY) {
    this.color = Math.floor(Math.random(1) * 4) + 1;
    this.posX = posX;
    this.posY = posY;
  }

  toJSON() {
    return this.color;
  }
};
