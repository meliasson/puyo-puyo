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
    for (let i = 0; i < this.grid.length; i += 1) {
      for (let j = 0; j < this.grid[0].length; j += 1) {
        const puyo = this.grid[i][j];
        if (!puyo || puyo.isVisited) {
          continue;
        }

        // Identify puyos to explode.
        const candidates = new Set([puyo]);
        candidates.forEach(candidate => {
          candidate.isVisited = true;

          // Check top neighbor.
          if (candidate.posY - 1 > 0) {
            const n = this.grid[candidate.posY - 1][candidate.posX];
            if (n && n.color === candidate.color) {
              candidates.add(n);
            }
          }

          // Check right neighbor
          if (candidate.posX + 1 < this.grid[0].length) {
            const n = this.grid[candidate.posY][candidate.posX + 1];
            if (n && n.color === candidate.color) {
              candidates.add(n);
            }
          }

          // Check bottom neighbor
          if (candidate.posY + 1 < this.grid.length) {
            const n = this.grid[candidate.posY + 1][candidate.posX];
            if (n && n.color === candidate.color) {
              candidates.add(n);
            }
          }

          // Check left neighbor
          if (candidate.posX - 1 > 0) {
            const n = this.grid[candidate.posY][candidate.posX - 1];
            if (n && n.color === candidate.color) {
              candidates.add(n);
            }
          }
        });

        // Explode puyos.
        if (candidates.size > 3) {
          candidates.forEach(candidate => {
            this.grid[candidate.posY][candidate.posX] = null;
          });
        }
      }
    }

    // Reset all puyos.
    this.grid.forEach(row => {
      row.forEach(pr => {
        if (pr) {
          pr.isVisited = false;
        }
      });
    });

    this.switchStateToPuyosDown();
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
      // TODO: Switch to null piece.
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
    }
  }

  switchStateToExplodePuyos() {
    this.state = "puyosExplode";
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
