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

class SteerablePuyo extends Puyo {
  constructor(posX, posY) {
    super(posX, posY);
    this.isSteerable = true;
  }
}

class Board {
  constructor() {
    this._grid = this._buildGrid(16, 6);
    this._puyos = [new Puyo(0, 0), new SteerablePuyo(2, 0)];

    this._puyos.forEach(puyo => {
      this._grid[puyo.posX][puyo.posY] = puyo;
    });

    // TODO: Implement gravity with two loops: one for regular puyos,
    // which are dropped all the time, and one for steerable puyous,
    // which falls slower.
  }

  movePieceLeft() {
    this._puyos.forEach(puyo => {
      if (!puyo.isSteerable) {
        return;
      }

      const oldPosX = puyo.posX;
      const newPosX = oldPosX - 1;
      puyo.posX = newPosX;
      this._grid[oldPosX][puyo.posY] = null;
      this._grid[newPosX][puyo.posY] = puyo;
    });
  }

  movePieceRight() {
    this._puyos.forEach(puyo => {
      if (!puyo.isSteerable) {
        return;
      }

      const oldPosX = puyo.posX;
      const newPosX = oldPosX + 1;
      puyo.posX = newPosX;
      this._grid[oldPosX][puyo.posY] = null;
      this._grid[newPosX][puyo.posY] = puyo;
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
