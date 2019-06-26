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
    this._puyos = [new Puyo(0, 0), new SteerablePuyo(1, 0)];

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
    this._clients = new Map();
  }

  join(clientId) {
    this._clients.set(clientId, new Board());
  }

  leave(clientId) {
    delete this._clients[clientId];
  }

  isFull() {
    return this._clients.size == 2;
  }

  isParticipant(clientId) {
    return this._clients.has(clientId);
  }

  update(clientId, action) {
    const client = this._clients.get(clientId);
    switch (action) {
      case "rotate":
        break;
      case "drop":
        break;
      case "left":
        client.movePieceLeft();
        break;
      case "right":
        client.movePieceRight();
        break;
      default:
        throw new Error("Unknown action");
    }
  }

  toJSON() {
    return { boards: Array.from(this._clients.values()) };
  }
}

const games = [];
function joinGame(clientId) {
  for (game of games) {
    if (game.isFull()) {
      continue;
    } else {
      game.join(clientId);
      return game;
    }
  }
  game = new Game();
  game.join(clientId);
  games.push(game);
}

function findGame(clientId) {
  for (game of games) {
    if (game.isParticipant(clientId)) {
      return game;
    }
  }
}

const port = process.env.PORT || 3100;

// Express
const express = require("express");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "client/build")));
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname + "/client/build/index.html"))
);
app.get("/ping", (req, res) => res.json({ pong: "Pong!" }));
const expressServer = app.listen(port, () => {
  console.log(`Express listening on port ${port}`);
});

// Websocket
const uuidv1 = require("uuid/v1");
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server: expressServer });
console.log(`Websocket listening on port ${port}`);
wss.on("connection", function connection(ws) {
  ws.id = uuidv1();
  console.log(`Websocket client ${ws.id} connected`);
  joinGame(ws.id);
  ws.send(JSON.stringify({ status: "connected", id: ws.id }));

  ws.on("message", function incoming(event) {
    console.log(`Websocket received message ${event} from client ${ws.id}`);
    const message = JSON.parse(event);
    findGame(ws.id).update(ws.id, message.action);
  });

  ws.on("close", function incoming() {
    console.log(`Websocket client ${ws.id} disconnected`);
    findGame(ws.id).leave(ws.id);
  });
});

// Game loop
function gameLoop() {
  for (game of games) {
    const message = JSON.stringify({ status: "loop", game: game });
    for (const client of wss.clients) {
      if (game.isParticipant(client.id)) {
        client.send(message);
      }
    }
  }
}
//setInterval(gameLoop, 1000 / 30);
setInterval(gameLoop, 1000);
