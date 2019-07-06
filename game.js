class Puyo {
  constructor(posX, posY) {
    this.posX = posX;
    this.posY = posY;
    this.isSteerable = false;
  }

  toJSON() {
    return 1;
  }
}

class Piece {
  constructor(posX, posY) {
    this._rotatingPuyo = new Puyo(posX, posY);
    this._pivotingPuyo = new Puyo(posX, posY + 1);
  }

  puyos() {
    return [this._rotatingPuyo, this._pivotingPuyo];
  }

  moveLeft() {
    this._rotatingPuyo.posX -= 1;
    this._pivotingPuyo.posX -= 1;
  }

  moveRight() {
    this._rotatingPuyo.posX += 1;
    this._pivotingPuyo.posX += 1;
  }

  rotate() {
    if (this._rotatingPuyo.posY === this._pivotingPuyo.posY) {
      this._rotateWhenHorizontal();
    } else {
      this._rotateWhenVertical();
    }
  }

  _rotateWhenHorizontal() {
    if (this._rotatingPuyo.posX === this._pivotingPuyo.posX - 1) {
      // Rotate puyo to the left.
      this._rotatingPuyo.posX += 1;
      this._rotatingPuyo.posY -= 1;
    } else {
      // Rotate puyo to the right.
      this._rotatingPuyo.posX -= 1;
      this._rotatingPuyo.posY += 1;
    }
  }

  _rotateWhenVertical() {
    if (this._rotatingPuyo.posY === this._pivotingPuyo.posY - 1) {
      // Rotate top puyo.
      this._rotatingPuyo.posX += 1;
      this._rotatingPuyo.posY += 1;
    } else {
      // Rotate bottom puyo.
      this._rotatingPuyo.posX -= 1;
      this._rotatingPuyo.posY -= 1;
    }
  }
}

class Board {
  constructor() {
    this._grid = this._buildGrid(16, 6);
    this._piece = new Piece(3, 0);

    this._piece.puyos().forEach(puyo => {
      this._grid[puyo.posX][puyo.posY] = puyo;
    });

    // TODO: Implement gravity with two loops: one for regular puyos,
    // which are dropped all the time, and one for the steerabe piece,
    // which falls slower.
  }

  movePieceLeft() {
    this._piece.puyos().forEach(puyo => {
      this._grid[puyo.posX][puyo.posY] = null;
    });
    this._piece.moveLeft();
    this._piece.puyos().forEach(puyo => {
      this._grid[puyo.posX][puyo.posY] = puyo;
    });
  }

  movePieceRight() {
    this._piece.puyos().forEach(puyo => {
      this._grid[puyo.posX][puyo.posY] = null;
    });
    this._piece.moveRight();
    this._piece.puyos().forEach(puyo => {
      this._grid[puyo.posX][puyo.posY] = puyo;
    });
  }

  rotatePiece() {
    this._piece.puyos().forEach(puyo => {
      this._grid[puyo.posX][puyo.posY] = null;
    });
    this._piece.rotate();
    this._piece.puyos().forEach(puyo => {
      this._grid[puyo.posX][puyo.posY] = puyo;
    });
  }

  _buildGrid(height, width) {
    const grid = [];
    for (let i = 0; i < height; i++) {
      grid[i] = [];
      for (let j = 0; j < width; j++) {
        grid[i][j] = null;
      }
    }

    return grid;
  }

  toJSON() {
    return this._grid;
  }
}

class Game {
  constructor() {
    this._boards = new Map();
  }

  join(player) {
    this._boards.set(player, new Board());

    if (this.isFull()) {
      setInterval(() => this._step(), 1000);
    }
  }

  leave(player) {
    delete this._boards[player];
  }

  isFull() {
    return this._boards.size == 2;
  }

  isParticipant(player) {
    return this._boards.has(player);
  }

  update(player, action) {
    const board = this._boards.get(player);
    switch (action) {
      case "rotate":
        board.rotatePiece();
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

  toJSON() {
    return { boards: Array.from(this._boards.values()) };
  }

  _step() {
    const message = JSON.stringify({ status: "loop", game: this.toJSON() });
    for (const player of this._boards.keys()) {
      player.send(message);
    }
  }
}

const games = [];

function joinGame(player) {
  // Attempt to re-join an existing game.
  for (const game of games) {
    if (game.isParticipant(player)) {
      return game;
    }
  }

  // Attempt to join an existing game.
  for (const game of games) {
    if (game.isFull()) {
      continue;
    } else {
      game.join(player);
      return game;
    }
  }

  // Create a new game.
  const game = new Game();
  game.join(player);
  games.push(game);
  return game;
}

function findGame(player) {}

module.exports = {
  join: joinGame
};
