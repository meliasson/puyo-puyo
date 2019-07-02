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

  moveLeft() {
    this._rotatingPuyo.posX -= 1;
    this._pivotingPuyo.posX -= 1;
  }

  moveRight() {
    this._rotatingPuyo.posX += 1;
    this._pivotingPuyo.posX += 1;
  }

  rotate() {
    if (this._rotatingPuyo.posX === this._pivotingPuyo.posX) {
      if (this._rotatingPuyo.posY === this._pivotingPuyo.posY - 1) {
        // piece is vertical with rotating puyo on top
        this._rotatingPuyo.posX += 1;
        this._rotatingPuyo.posY += 1;
        return;
      } else {
        // piece is vertical with pivoting puyo on top
        this._rotatingPuyo.posX -= 1;
        this._rotatingPuyo.posY -= 1;
        return;
      }
    }
    if (this._rotatingPuyo.posY === this._pivotingPuyo.posY) {
      if (this._rotatingPuyo.posX === this._pivotingPuyo.posX - 1) {
        // piece is horizontal with rotating puyo to the left
        this._rotatingPuyo.posX += 1;
        this._rotatingPuyo.posY -= 1;
        return;
      } else {
        // piece is horizontal with rotating puyo to the right
        this._rotatingPuyo.posX -= 1;
        this._rotatingPuyo.posY += 1;
        return;
      }
    }
  }

  puyos() {
    return [this._rotatingPuyo, this._pivotingPuyo];
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
    this._boards.set(player.id, new Board());
  }

  leave(player) {
    delete this._boards[player.id];
  }

  isFull() {
    return this._boards.size == 2;
  }

  isParticipant(player) {
    return this._boards.has(player.id);
  }

  update(player, action) {
    const board = this._boards.get(player.id);
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
}

const games = [];

function joinGame(player) {
  if (findGame(player)) {
    return;
  }

  for (game of games) {
    if (game.isFull()) {
      continue;
    } else {
      game.join(player);
      return game;
    }
  }
  game = new Game();
  game.join(player);
  games.push(game);
}

function findGame(player) {
  for (game of games) {
    if (game.isParticipant(player)) {
      return game;
    }
  }
}

function loopGames(players) {
  for (game of games) {
    const message = JSON.stringify({ status: "loop", game: game });
    for (const player of players) {
      if (game.isParticipant(player)) {
        player.send(message);
      }
    }
  }
}

function run(players) {
  setInterval(loopGames, 1000 / 30, players);
  // setInterval(loopGames, 1000, players);
}

module.exports = {
  find: findGame,
  join: joinGame,
  run
};
