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

  isDownMoveInvalid() {
    this.piece.moveDown();

    const invalidMove = this.isMoveInvalid();
    this.piece.moveUp();

    return invalidMove;
  }

  isPuyoDownMoveInvalid(puyo) {
    puyo.posY += 1;

    const invalidMove = this.isPuyoPositionInvalid(puyo);
    puyo.posY -= 1;

    return invalidMove;
  }

  isLeftMoveInvalid() {
    this.piece.moveLeft();

    const invalidMove = this.isMoveInvalid();
    this.piece.moveRight();

    return invalidMove;
  }

  isRightMoveInvalid() {
    this.piece.moveRight();

    const invalidMove = this.isMoveInvalid();
    this.piece.moveLeft();

    return invalidMove;
  }

  isRotationInvalid() {
    this.piece.rotateClockwise();

    const invalidMove = this.isMoveInvalid();
    this.piece.rotateCounterClockwise();

    return invalidMove;
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
    }

    if (this.isDownMoveInvalid()) {
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

  switchStateFromPieceDownToPuyosDown() {
    this.piece.dismantle();
    this.state = "puyosDown";
  }

  movePieceLeft() {
    if (this.isLeftMoveInvalid()) {
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
    if (this.isRightMoveInvalid()) {
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
    this.grid.forEach(row => {
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

  letPuyosExplode() {
    this.state = "puyosDown";
  }

  rotatePiece() {
    if (this.isRotationInvalid()) {
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
    console.log(this.state);
    const now = Date.now();
    const timeSinceLastStep = now - this.steppedAt;

    if (this.state === "pieceDown" && timeSinceLastStep > 1000) {
      this.movePieceDown();
      this.steppedAt = now;
    } else if (this.state === "puyosDown" && timeSinceLastStep > 300) {
      this.movePuyosDown();
      this.steppedAt = now;
    } else if (this.state === "puyosExplode" && timeSinceLastStep > 300) {
      console.log("State is explodePuyos");
      this.letPuyosExplode();
      // TODO: Go back to state dropPuyos.
    }
  }

  toJSON() {
    return this.grid;
  }

  isMoveInvalid() {
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

    const otherPuyo = this.grid[puyo.posY][puyo.posX];
    if (otherPuyo !== null && !otherPuyo.partOfPiece) {
      return true;
    }

    return false;
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
