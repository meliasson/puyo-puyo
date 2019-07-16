const Puyo = require("./Puyo");

module.exports = class Piece {
  constructor(posX, posY) {
    this.isDismantled = false;
    this.pivotingPuyo = new Puyo(posX, posY + 1, true);
    this.rotatingPuyo = new Puyo(posX, posY, true);
  }

  dismantle() {
    this.isDismantled = true;
    this.pivotingPuyo.removeFromPiece();
    this.rotatingPuyo.removeFromPiece();
  }

  moveDown() {
    // TODO: Consider implementing a NullPiece so we don't need guard
    // clauses like this one.
    if (this.isDismantled) {
      return;
    }

    this.pivotingPuyo.posY += 1;
    this.rotatingPuyo.posY += 1;
  }

  moveLeft() {
    if (this.isDismantled) {
      return;
    }

    this.pivotingPuyo.posX -= 1;
    this.rotatingPuyo.posX -= 1;
  }

  moveRight() {
    if (this.isDismantled) {
      return;
    }

    this.pivotingPuyo.posX += 1;
    this.rotatingPuyo.posX += 1;
  }

  moveUp() {
    if (this.isDismantled) {
      return;
    }

    this.pivotingPuyo.posY -= 1;
    this.rotatingPuyo.posY -= 1;
  }

  puyos() {
    if (this.isDismantled) {
      return [];
    }

    return [this.pivotingPuyo, this.rotatingPuyo];
  }

  rotateClockwise() {
    if (this.isDismantled) {
      return;
    }

    if (this.rotatingPuyo.posY === this.pivotingPuyo.posY) {
      this.rotateClockwiseWhenHorizontal();
    } else {
      this.rotateClockwiseWhenVertical();
    }
  }

  rotateCounterClockwise() {
    if (this.isDismantled) {
      return;
    }

    if (this.rotatingPuyo.posY === this.pivotingPuyo.posY) {
      this.rotateCounterClockwiseWhenHorizontal();
    } else {
      this.rotateCounterClockwiseWhenVertical();
    }
  }

  rotateClockwiseWhenHorizontal() {
    if (this.rotatingPuyo.posX === this.pivotingPuyo.posX - 1) {
      // Rotate puyo to top.
      this.rotatingPuyo.posX += 1;
      this.rotatingPuyo.posY -= 1;
    } else {
      // Rotate puyo to bottom.
      this.rotatingPuyo.posX -= 1;
      this.rotatingPuyo.posY += 1;
    }
  }

  rotateClockwiseWhenVertical() {
    if (this.rotatingPuyo.posY === this.pivotingPuyo.posY - 1) {
      // Rotate puyo to right.
      this.rotatingPuyo.posX += 1;
      this.rotatingPuyo.posY += 1;
    } else {
      // Rotate puyo to left.
      this.rotatingPuyo.posX -= 1;
      this.rotatingPuyo.posY -= 1;
    }
  }

  rotateCounterClockwiseWhenHorizontal() {
    if (this.rotatingPuyo.posX === this.pivotingPuyo.posX - 1) {
      // Rotate puyo to bottom.
      this.rotatingPuyo.posX += 1;
      this.rotatingPuyo.posY += 1;
    } else {
      // Rotate puyo to top.
      this.rotatingPuyo.posX -= 1;
      this.rotatingPuyo.posY -= 1;
    }
  }

  rotateCounterClockwiseWhenVertical() {
    if (this.rotatingPuyo.posY === this.pivotingPuyo.posY - 1) {
      // Rotate puyo to left.
      this.rotatingPuyo.posX -= 1;
      this.rotatingPuyo.posY += 1;
    } else {
      // Rotate puyo to right.
      this.rotatingPuyo.posX += 1;
      this.rotatingPuyo.posY -= 1;
    }
  }
};
