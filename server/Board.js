const NullPiece = require("./NullPiece");
const Piece = require("./Piece");

module.exports = class Board {
  constructor() {
    this.grid = this.buildGrid(12, 6);
    // TODO: Perhaps constructor should invoke some kind of central
    // state switching function immediately instead of spawning piece
    // etc?
    this.spawnPiece();
    this.steppedAt = Date.now();
    this.switchStateToPieceDown();
  }

  dropPiece() {
    // TODO: Can we do this check a bit sweeter?
    if (this.state !== "pieceDown") {
      return;
    }

    this.piece = new NullPiece();
    this.switchStateToPieceDropped();
  }

  explodePuyos() {
    this.grid.forEach(row => {
      row.forEach(puyo => {
        const connectedPuyos = this.findConnectedPuyos(puyo);
        if (connectedPuyos.size > 3) {
          connectedPuyos.forEach(connectedPuyo => {
            this.grid[connectedPuyo.posY][connectedPuyo.posX] = null;
          });
        }
      });
    });

    // Reset all puyos.
    this.grid.forEach(row => {
      row.forEach(puyo => {
        if (puyo) {
          puyo.isVisited = false;
        }
      });
    });

    this.switchStateToPuyosDown();
  }

  findConnectedPuyos(puyo) {
    const result = new Set();
    if (!puyo || puyo.isVisited) {
      return new Set();
    }

    result.add(puyo);
    result.forEach(connectedPuyo => {
      connectedPuyo.isVisited = true;
      const puyoAbove = this.getConnectedPuyoAbove(connectedPuyo);
      if (puyoAbove) {
        result.add(puyoAbove);
      }
      const puyoBelow = this.getConnectedPuyoBelow(connectedPuyo);
      if (puyoBelow) {
        result.add(puyoBelow);
      }
      const puyoToLeft = this.getConnectedPuyoBelow(connectedPuyo);
      if (puyoToLeft) {
        result.add(puyoBelow);
      }
      const puyoToRight = this.getConnectedPuyoToRight(connectedPuyo);
      if (puyoToRight) {
        result.add(puyoToRight);
      }
    });

    return result;
  }

  getConnectedPuyoAbove(puyo) {
    if (puyo.posY - 1 > 0) {
      const puyoAbove = this.grid[puyo.posY - 1][puyo.posX];
      if (puyoAbove && puyoAbove.color === puyo.color) {
        return puyoAbove;
      }
    }
  }

  getConnectedPuyoBelow(puyo) {
    if (puyo.posY + 1 < this.grid.length) {
      const puyoBelow = this.grid[puyo.posY + 1][puyo.posX];
      if (puyoBelow && puyoBelow.color === puyo.color) {
        return puyoBelow;
      }
    }
  }

  getConnectedPuyoToLeft(puyo) {
    if (puyo.posX - 1 < 0) {
      const puyoToLeft = this.grid[puyo.posY][puyo.posX - 1];
      if (puyoToLeft && puyoToLeft.color === puyo.color) {
        return puyoToLeft;
      }
    }
  }

  getConnectedPuyoToRight(puyo) {
    if (puyo.posX + 1 < this.grid[0].length) {
      const puyoToRight = this.grid[puyo.posY][puyo.posX + 1];
      if (puyoToRight && puyoToRight.color === puyo.color) {
        return puyoToRight;
      }
    }
  }

  insertPieceIntoGrid() {
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = puyo;
    });
  }

  isPieceDownMoveInvalid() {
    this.piece.moveDown();

    const invalidMove = this.isPiecePositionInvalid();
    this.piece.moveUp();

    return invalidMove;
  }

  isPieceLeftMoveInvalid() {
    this.piece.moveLeft();

    const invalidMove = this.isPiecePositionInvalid();
    this.piece.moveRight();

    return invalidMove;
  }

  isPieceRightMoveInvalid() {
    this.piece.moveRight();

    const invalidMove = this.isPiecePositionInvalid();
    this.piece.moveLeft();

    return invalidMove;
  }

  isPieceRotationInvalid() {
    this.piece.rotateClockwise();

    const invalidMove = this.isPiecePositionInvalid();
    this.piece.rotateCounterClockwise();

    return invalidMove;
  }

  isPuyoDownMoveInvalid(puyo) {
    // TODO: Create puyo.moveDown() etc?
    puyo.posY += 1;

    const invalidMove = this.isPuyoPositionInvalid(puyo);
    puyo.posY -= 1;

    return invalidMove;
  }

  moveDroppedPieceDown() {
    let isPuyoMovedDown = false;
    // TODO: Figure out if we can express the need to loop backwards
    // with code. We do it because otherwise we'll move a puyo to the
    // next row and when we get to the next row we'll immediately move
    // it again, resulting in puyos that move too fast.
    this.grid
      .slice()
      .reverse()
      .forEach(row => {
        row.forEach(puyo => {
          // TODO: Consider implementing a NullPuyo so we don't have to
          // check for null in places like this.
          if (puyo) {
            if (this.isPuyoDownMoveInvalid(puyo)) {
              return;
            }

            this.grid[puyo.posY][puyo.posX] = null;

            // TODO: Make this a function?
            puyo.posY += 1;

            this.grid[puyo.posY][puyo.posX] = puyo;

            isPuyoMovedDown = true;
          }
        });
      });

    if (!isPuyoMovedDown) {
      this.switchStateToExplodePuyos();
    }
  }

  movePieceDown() {
    this.removePieceFromGrid();
    if (!this.isPieceDownMoveInvalid()) {
      this.piece.moveDown();
      this.insertPieceIntoGrid();
    } else {
      this.insertPieceIntoGrid();
      this.piece = new NullPiece();
      this.switchStateToPuyosDown();
    }
  }

  movePieceLeft() {
    this.removePieceFromGrid();
    if (!this.isPieceLeftMoveInvalid()) {
      this.piece.moveLeft();
    }
    this.insertPieceIntoGrid();
  }

  movePieceRight() {
    this.removePieceFromGrid();
    if (!this.isPieceRightMoveInvalid()) {
      this.piece.moveRight();
    }
    this.insertPieceIntoGrid();
  }

  movePuyosDown() {
    let isPuyoMovedDown = false;
    // TODO: Figure out if we can express the need to loop backwards
    // with code. We do it because otherwise we'll move a puyo to the
    // next row and when we get to the next row we'll immediately move
    // it again, resulting in puyos that move too fast.
    this.grid
      .slice()
      .reverse()
      .forEach(row => {
        row.forEach(puyo => {
          // TODO: Consider implementing a NullPuyo so we don't have to
          // check for null in places like this.
          if (puyo) {
            if (this.isPuyoDownMoveInvalid(puyo)) {
              return;
            }

            this.grid[puyo.posY][puyo.posX] = null;

            // TODO: Make this a function?
            puyo.posY += 1;

            this.grid[puyo.posY][puyo.posX] = puyo;

            isPuyoMovedDown = true;
          }
        });
      });

    if (isPuyoMovedDown) {
      this.switchStateToExplodePuyos();
    } else {
      this.spawnPiece();
      this.switchStateToPieceDown();
    }
  }

  removePieceFromGrid() {
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = null;
    });
  }

  rotatePiece() {
    this.removePieceFromGrid();
    if (!this.isPieceRotationInvalid()) {
      this.piece.rotateClockwise();
    }
    this.insertPieceIntoGrid();
  }

  spawnPiece() {
    if (this.grid[0][3] || this.grid[1][3]) {
      this.switchStateToGameOver();
      return;
    }

    this.piece = new Piece(3, 0);
    this.insertPieceIntoGrid();
  }

  step() {
    const now = Date.now();
    const timeSinceLastStep = now - this.steppedAt;

    if (this.state === "pieceDown" && timeSinceLastStep > 1000) {
      this.movePieceDown();
      this.steppedAt = now;
    } else if (this.state === "pieceDropped") {
      this.moveDroppedPieceDown();
      this.steppedAt = now;
    } else if (this.state === "puyosDown") {
      this.movePuyosDown();
      this.steppedAt = now;
    } else if (this.state === "puyosExplode" && timeSinceLastStep > 100) {
      this.explodePuyos();
      this.steppedAt = now;
    } else if (this.state === "gameOver") {
      // NOOP at the moment.
    }
  }

  switchStateToExplodePuyos() {
    this.state = "puyosExplode";
  }

  switchStateToGameOver() {
    this.state = "gameOver";
  }

  switchStateToPieceDown() {
    this.state = "pieceDown";
  }

  switchStateToPieceDropped() {
    this.state = "pieceDropped";
  }

  switchStateToPuyosDown() {
    this.state = "puyosDown";
  }

  toJSON() {
    // TODO: Return full object instead? (So we can determine amount
    // of debris and realize when we're in a game over state.)
    return this.grid;
  }

  isPiecePositionInvalid() {
    const isPositionInvalid = this.piece.puyos().find(puyo => {
      return this.isPuyoPositionInvalid(puyo);
    });
    return isPositionInvalid;
  }

  isPuyoColliding(puyo) {
    return this.grid[puyo.posY][puyo.posX];
  }

  isPuyoPositionInvalid(puyo) {
    return this.isPuyoOutsideBoundaries(puyo) || this.isPuyoColliding(puyo);
  }

  isPuyoOutsideBoundaries(puyo) {
    return puyo.posX < 0 || puyo.posY < 0 || puyo.posX > 5 || puyo.posY > 11;
  }

  buildGrid(height, width) {
    const grid = [];
    for (let i = 0; i < height; i += 1) {
      grid[i] = [];
      for (let j = 0; j < width; j += 1) {
        grid[i][j] = null;
      }
    }

    return grid;
  }
};
