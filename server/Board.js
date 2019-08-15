const Piece = require("./Piece");

module.exports = class Board {
  constructor() {
    this.grid = this.buildGrid(12, 6);

    this.piece = new Piece(3, 0);
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = puyo;
    });

    this.steppedAt = Date.now();
    this.state = "pieceDown";
  }

  dropPiece() {
    if (this.piece.isDismantled) {
      return;
    }

    this.switchStateFromPieceDownToPuyosDown();
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
      this.piece.puyos().forEach(puyo => {
        this.grid[puyo.posY][puyo.posX] = puyo;
      });
      return;
    }

    if (this.isPieceDownMoveInvalid()) {
      this.switchStateFromPieceDownToPuyosDown();
      return;
    }

    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = null;
    });

    this.piece.moveDown();

    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = puyo;
    });
  }

  movePieceLeft() {
    if (this.isPieceLeftMoveInvalid()) {
      return;
    }

    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = null;
    });

    this.piece.moveLeft();

    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = puyo;
    });
  }

  movePieceRight() {
    if (this.isPieceRightMoveInvalid()) {
      return;
    }

    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = null;
    });

    this.piece.moveRight();

    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = puyo;
    });
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
          if (puyo !== null && !puyo.partOfPiece) {
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

  rotatePiece() {
    if (this.isPieceRotationInvalid()) {
      return;
    }

    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = null;
    });

    this.piece.rotateClockwise();

    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = puyo;
    });
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
    const puyoOutsideBoundaries = this.piece.puyos().find(puyo => {
      return puyo.posX < 0 || puyo.posY < 0 || puyo.posX > 5 || puyo.posY > 11;
    });

    if (puyoOutsideBoundaries) {
      return true;
    }

    const puyoColliding = this.piece.puyos().find(puyo => {
      const cell = this.grid[puyo.posY][puyo.posX];
      return cell !== null && !cell.partOfPiece;
    });

    return puyoColliding;
  }

  isPuyoPositionInvalid(puyo) {
    if (puyo.posX < 0 || puyo.posY < 0 || puyo.posX > 5 || puyo.posY > 11) {
      return true;
    }

    const isPuyoColliding = this.grid[puyo.posY][puyo.posX];
    return isPuyoColliding;
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
