module.exports = class Puyo {
  constructor(posX, posY, partOfPiece = false) {
    this.color = Math.floor(Math.random(1) * 4) + 1;
    this.partOfPiece = partOfPiece;
    this.posX = posX;
    this.posY = posY;
  }

  removeFromPiece() {
    this.partOfPiece = false;
  }

  toJSON() {
    return this.color;
  }
};
