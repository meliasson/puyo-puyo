class Puyo {
  constructor(posX, posY, partOfPiece = false) {
    this.posX = posX;
    this.posY = posY;
    this.partOfPiece = partOfPiece;
  }

  toJSON() {
    return 1;
  }
}

class Piece {
  constructor(posX, posY) {
    this.pivotingPuyo = new Puyo(posX, posY + 1, true);
    this.rotatingPuyo = new Puyo(posX, posY, true);
  }

  moveDown() {
    this.pivotingPuyo.posY += 1;
    this.rotatingPuyo.posY += 1;
  }

  moveLeft() {
    this.pivotingPuyo.posX -= 1;
    this.rotatingPuyo.posX -= 1;
  }

  moveRight() {
    this.pivotingPuyo.posX += 1;
    this.rotatingPuyo.posX += 1;
  }

  moveUp() {
    this.pivotingPuyo.posY -= 1;
    this.rotatingPuyo.posY -= 1;
  }

  puyos() {
    return [this.pivotingPuyo, this.rotatingPuyo];
  }

  rotateClockwise() {
    if (this.rotatingPuyo.posY === this.pivotingPuyo.posY) {
      this.rotateClockwiseWhenHorizontal();
    } else {
      this.rotateClockwiseWhenVertical();
    }
  }

  rotateCounterClockwise() {
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
}

class Board {
  constructor() {
    this.grid = this.buildGrid(12, 6);

    this.piece = new Piece(3, 0);
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posY][puyo.posX] = puyo;
    });

    this.lastDownMoveAt = Date.now();
  }

  isDownMoveInvalid() {
    this.piece.moveDown();

    const invalidMove = this.isMoveInvalid();
    this.piece.moveUp();

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
    if (this.isDownMoveInvalid()) {
      // TODO: Dismantle piece into regular puyos here.
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
    const now = Date.now();
    const delta = now - this.lastDownMoveAt;
    if (delta > 1000) {
      this.movePieceDown();
      this.lastDownMoveAt = now;
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
}

class Game {
  constructor() {
    this.boards = new Map();
  }

  isFull() {
    return this.boards.size === 2;
  }

  isParticipant(player) {
    return this.boards.has(player);
  }

  join(player) {
    this.boards.set(player, new Board());

    if (this.boards.size > 0) {
      setInterval(() => this.step(), 1000 / 30);
    }
  }

  leave(player) {
    delete this.boards[player];
  }

  toJSON() {
    return { boards: Array.from(this.boards.values()) };
  }

  update(player, action) {
    const board = this.boards.get(player);
    switch (action) {
      case "rotate":
        board.rotatePiece();
        break;
      case "drop":
        break;
      case "left":
        board.movePieceLeft();
        break;
      case "right":
        board.movePieceRight();
        break;
      default:
        throw new Error("Unknown action");
    }
  }

  step() {
    this.boards.forEach(board => {
      board.step();
    });

    const message = JSON.stringify({ status: "loop", game: this.toJSON() });

    Array.from(this.boards.keys()).forEach(player => {
      player.send(message);
    });
  }
}

const games = [];

function joinGame(player) {
  //
  // Attempt to re-join an existing game.
  //

  const gameToRejoin = games.find(game => {
    return game.isParticipant(player);
  });

  if (gameToRejoin) {
    gameToRejoin.join(player);
    return gameToRejoin;
  }

  //
  // Attempt to join an existing game.
  //

  const gameToJoin = games.find(game => {
    return !game.isFull();
  });

  if (gameToJoin) {
    gameToJoin.join(player);
    return gameToJoin;
  }

  //
  // Create a new game.
  //

  const game = new Game();
  game.join(player);
  games.push(game);
  return game;
}

module.exports = {
  join: joinGame
};
