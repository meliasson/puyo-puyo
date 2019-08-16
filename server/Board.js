const Piece = require("./Piece");

module.exports = class Board {
  constructor() {
    this.grid = this.buildGrid(12, 6);

    this.piece = new Piece(3, 0);
    this.insertPieceIntoGrid();

    this.steppedAt = Date.now();
    this.state = "pieceDown";
  }

  dropPiece() {
    if (this.piece.isDismantled) {
      return;
    }

    this.switchStateFromPieceDownToPuyosDown();
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
    puyo.posY += 1;

    const invalidMove = this.isPuyoPositionInvalid(puyo);
    puyo.posY -= 1;

    return invalidMove;
  }

  letPuyosExplode() {
    this.state = "puyosDown";
  }

  movePieceDown() {
    // TODO: Should we do this check _once_ in a central place
    // responsible for state switching instead?.
    if (this.piece.isDismantled) {
      // TODO: Create a function for piece spawning and re-use it here
      // and in constructor? Perhaps constructor should invoke central
      // state switching function immediately instead of spawning piece
      // etc?
      this.piece = new Piece(3, 0);
      this.insertPieceIntoGrid();
      return;
    }

    this.removePieceFromGrid();
    if (!this.isPieceDownMoveInvalid()) {
      this.piece.moveDown();
      this.insertPieceIntoGrid();
    } else {
      this.insertPieceIntoGrid();
      this.switchStateFromPieceDownToPuyosDown();
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
      this.state = "puyosExplode";
    } else {
      this.state = "pieceDown";
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

  step() {
    const now = Date.now();
    const timeSinceLastStep = now - this.steppedAt;

    if (this.state === "pieceDown" && timeSinceLastStep > 1000) {
      this.movePieceDown();
      this.steppedAt = now;
    } else if (this.state === "puyosDown") {
      this.movePuyosDown();
      this.steppedAt = now;
    } else if (this.state === "puyosExplode") {
      this.letPuyosExplode();
      this.steppedAt = now;
      // TODO: Go back to state dropPuyos.
    }
  }

  switchStateFromPieceDownToPuyosDown() {
    this.piece.dismantle();
    this.state = "puyosDown";
  }

  toJSON() {
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
