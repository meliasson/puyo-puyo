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
    this.rotatingPuyo = new Puyo(posX, posY);
    this.pivotingPuyo = new Puyo(posX, posY + 1);
  }

  puyos() {
    return [this.rotatingPuyo, this.pivotingPuyo];
  }

  moveLeft() {
    this.rotatingPuyo.posX -= 1;
    this.pivotingPuyo.posX -= 1;
  }

  moveRight() {
    this.rotatingPuyo.posX += 1;
    this.pivotingPuyo.posX += 1;
  }

  rotate() {
    if (this.rotatingPuyo.posY === this.pivotingPuyo.posY) {
      this.rotateWhenHorizontal();
    } else {
      this.rotateWhenVertical();
    }
  }

  rotateWhenHorizontal() {
    if (this.rotatingPuyo.posX === this.pivotingPuyo.posX - 1) {
      // Rotate puyo to the left.
      this.rotatingPuyo.posX += 1;
      this.rotatingPuyo.posY -= 1;
    } else {
      // Rotate puyo to the right.
      this.rotatingPuyo.posX -= 1;
      this.rotatingPuyo.posY += 1;
    }
  }

  rotateWhenVertical() {
    if (this.rotatingPuyo.posY === this.pivotingPuyo.posY - 1) {
      // Rotate puyo to the right.
      this.rotatingPuyo.posX += 1;
      this.rotatingPuyo.posY += 1;
    } else {
      // Rotate puyo to the left.
      this.rotatingPuyo.posX -= 1;
      this.rotatingPuyo.posY -= 1;
    }
  }
}

class Board {
  constructor() {
    this.grid = this.buildGrid(16, 6);
    this.piece = new Piece(3, 0);

    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posX][puyo.posY] = puyo;
    });

    // TODO: Implement gravity with two loops: one for regular puyos,
    // which are dropped all the time, and one for the steerabe piece,
    // which falls slower.
  }

  movePieceLeft() {
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posX][puyo.posY] = null;
    });
    this.piece.moveLeft();
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posX][puyo.posY] = puyo;
    });
  }

  movePieceRight() {
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posX][puyo.posY] = null;
    });
    this.piece.moveRight();
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posX][puyo.posY] = puyo;
    });
  }

  rotatePiece() {
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posX][puyo.posY] = null;
    });
    this.piece.rotate();
    this.piece.puyos().forEach(puyo => {
      this.grid[puyo.posX][puyo.posY] = puyo;
    });
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

  toJSON() {
    return this.grid;
  }
}

class Game {
  constructor() {
    this.boards = new Map();
  }

  join(player) {
    this.boards.set(player, new Board());

    if (this.isFull()) {
      setInterval(() => this.step(), 1000);
    }
  }

  leave(player) {
    delete this.boards[player];
  }

  isFull() {
    return this.boards.size === 2;
  }

  isParticipant(player) {
    return this.boards.has(player);
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

  toJSON() {
    return { boards: Array.from(this.boards.values()) };
  }

  step() {
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
