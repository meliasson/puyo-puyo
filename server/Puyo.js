module.exports = class Puyo {
  constructor(posX, posY, partOfPiece = false) {
    this.posX = posX;
    this.posY = posY;
    this.partOfPiece = partOfPiece;
  }

  removeFromPiece() {
    this.partOfPiece = false;
  }

  toJSON() {
    return 1;
  }
};
