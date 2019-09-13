const NullPiece = require("./NullPiece");
const Piece = require("./Piece");
const Puyo = require("./Puyo");

module.exports = class Board {
  constructor() {
    this.debris = 0;
    this.explodedPuyosInProgress = [];
    this.explodedPuyosResult = [];
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
    this.switchStateToPieceDropping();
  }

  explodePuyos() {
    let isPuyoExploded = false;
    this.grid.forEach(row => {
      row.forEach(puyo => {
        const connectedPuyos = this.findConnectedPuyos(puyo);
        const tmp = [...connectedPuyos];
        const connectedPuyosExcludingDebris = tmp.filter(
          puyo => puyo.color !== 5
        );
        if (connectedPuyosExcludingDebris.length > 3) {
          isPuyoExploded = true;
          this.explodedPuyosInProgress.push(
            connectedPuyosExcludingDebris.length
          );
          connectedPuyos.forEach(connectedPuyo => {
            this.grid[connectedPuyo.posY][connectedPuyo.posX] = null;
          });
        }
      });
    });

    if (isPuyoExploded) {
      this.switchStateToPuyosDown();
    } else {
      this.explodedPuyosResult = this.explodedPuyosInProgress;
      this.explodedPuyosInProgress = [];
      const isSpawnSuccessful = this.spawnPiece();
      if (isSpawnSuccessful) {
        this.switchStateToPieceDown();
      }
    }
  }

  findConnectedPuyos(puyo) {
    const result = new Set();
    if (!puyo) {
      return new Set();
    }

    result.add(puyo);
    result.forEach(connectedPuyo => {
      if (connectedPuyo.color !== 5) {
        const puyoAbove = this.getConnectedPuyoAbove(connectedPuyo);
        if (puyoAbove) {
          result.add(puyoAbove);
        }
        const puyoBelow = this.getConnectedPuyoBelow(connectedPuyo);
        if (puyoBelow) {
          result.add(puyoBelow);
        }
        const puyoToLeft = this.getConnectedPuyoToLeft(connectedPuyo);
        if (puyoToLeft) {
          result.add(puyoToLeft);
        }
        const puyoToRight = this.getConnectedPuyoToRight(connectedPuyo);
        if (puyoToRight) {
          result.add(puyoToRight);
        }
      }
    });

    return result;
  }

  getConnectedPuyoAbove(puyo) {
    if (puyo.posY - 1 >= 0) {
      const puyoAbove = this.grid[puyo.posY - 1][puyo.posX];
      if (
        puyoAbove &&
        (puyoAbove.color === puyo.color || puyoAbove.color === 5)
      ) {
        return puyoAbove;
      }
    }
  }

  getConnectedPuyoBelow(puyo) {
    if (puyo.posY + 1 < this.grid.length) {
      const puyoBelow = this.grid[puyo.posY + 1][puyo.posX];
      if (
        puyoBelow &&
        (puyoBelow.color === puyo.color || puyoBelow.color === 5)
      ) {
        return puyoBelow;
      }
    }
  }

  getConnectedPuyoToLeft(puyo) {
    if (puyo.posX - 1 >= 0) {
      const puyoToLeft = this.grid[puyo.posY][puyo.posX - 1];
      if (
        puyoToLeft &&
        (puyoToLeft.color === puyo.color || puyoToLeft.color === 5)
      ) {
        return puyoToLeft;
      }
    }
  }

  getConnectedPuyoToRight(puyo) {
    if (puyo.posX + 1 < this.grid[0].length) {
      const puyoToRight = this.grid[puyo.posY][puyo.posX + 1];
      if (
        puyoToRight &&
        (puyoToRight.color === puyo.color || puyoToRight.color === 5)
      ) {
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

  movePieceDown() {
    this.removePieceFromGrid();
    if (!this.isPieceDownMoveInvalid()) {
      this.piece.moveDown();
      this.insertPieceIntoGrid();
    } else {
      this.insertPieceIntoGrid();
      this.piece = new NullPiece();
      if (this.debris > 0) {
        this.switchStateToDebrisDown();
      } else {
        this.switchStateToPuyosDown();
      }
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

  movePuyosDown(pieceDropping = false) {
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

    if (!isPuyoMovedDown && pieceDropping && this.debris > 0) {
      this.switchStateToDebrisDown();
    } else if (!isPuyoMovedDown) {
      this.switchStateToExplodePuyos();
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
      return false;
    }

    this.piece = new Piece(3, 0);
    this.insertPieceIntoGrid();
    return true;
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
    } else if (this.state === "pieceDropping") {
      this.movePuyosDown(true);
      this.steppedAt = now;
    } else if (this.state === "puyosExplode" && timeSinceLastStep > 100) {
      this.explodePuyos();
      this.steppedAt = now;
    } else if (this.state === "debrisDown") {
      let counter = 0;
      for (let i = 0; i < this.grid.length; i += 1) {
        for (let j = 0; j < this.grid[i].length; j += 1) {
          if (counter >= this.debris) {
            break;
          }
          if (!this.grid[i][j]) {
            counter += 1;
            this.grid[i][j] = new Puyo(j, i, 5);
          }
        }
      }
      this.debris = 0;
      this.switchStateToPuyosDown();
    } else if (this.state === "gameOver") {
      // NOOP at the moment.
    }

    const explodedPuyos = this.explodedPuyosResult;
    this.explodedPuyosResult = [];
    return { explodedPuyos: explodedPuyos, state: this.state };
  }

  switchStateToDebrisDown() {
    this.state = "debrisDown";
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

  switchStateToPieceDropping() {
    this.state = "pieceDropping";
  }

  switchStateToPuyosDown() {
    this.state = "puyosDown";
  }

  toJSON() {
    return { grid: this.grid, state: this.state };
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
