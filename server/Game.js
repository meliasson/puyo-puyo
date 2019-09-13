const Board = require("./Board");

module.exports = class Game {
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

  update(player, action) {
    const board = this.boards.get(player);
    switch (action) {
      case "rotate":
        board.rotatePiece();
        break;
      case "drop":
        board.dropPiece();
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
    if (!this.isFull()) {
      const message = JSON.stringify({
        status: "waiting-for-opponent",
        game: this.toJSON()
      });
      Array.from(this.boards.keys()).forEach(player => {
        player.send(message);
      });
      return;
    }

    for (const [client, board] of this.boards) {
      const explodedPuyos = board.step();
      if (explodedPuyos.length > 0) {
        for (const [tmpClient, tmpBoard] of this.boards) {
          if (tmpClient !== client) {
            // tmpBoard.debris =
            //   explodedPuyos.reduce((acc, val) => {
            //     return acc + val;
            //   }) * explodedPuyos.length;
            tmpBoard.debris +=
              explodedPuyos.length === 1 ? 1 : 2 ** explodedPuyos.length;
          }
        }
      }
    }

    const message = JSON.stringify({ status: "loop", game: this.toJSON() });

    Array.from(this.boards.keys()).forEach(player => {
      player.send(message);
    });
  }
};
