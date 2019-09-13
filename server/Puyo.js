module.exports = class Puyo {
  constructor(posX, posY, color = null) {
    this.color = color ? color : Math.floor(Math.random(1) * 4) + 1;
    this.posX = posX;
    this.posY = posY;
  }

  toJSON() {
    return this.color;
  }
};
