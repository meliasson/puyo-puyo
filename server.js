const port = process.env.PORT || 3100;

// Game
const game = {
  clients: {},
  join: function(clientId) {
    this.clients[clientId] = {
      id: clientId,
      position: [Math.floor(Math.random() * 16), Math.floor(Math.random() * 9)]
    };
  },
  leave: function(clientId) {
    delete this.clients[clientId];
  },
  update: function(clientId, action) {
    const client = this.clients[clientId];
    switch (action) {
      case "up":
        client.position[1] = client.position[1] - 1;
        break;
      case "down":
        client.position[1] = client.position[1] + 1;
        break;
      case "left":
        client.position[0] = client.position[0] - 1;
        break;
      case "right":
        client.position[0] = client.position[0] + 1;
        break;
      default:
        throw new Error("Unknown action");
    }
  }
};

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
  game.join(ws.id);
  ws.send(JSON.stringify({ status: "connected", id: ws.id }));

  ws.on("message", function incoming(event) {
    console.log(`Websocket received message ${event} from client ${ws.id}`);
    const message = JSON.parse(event);
    game.update(ws.id, message.action);
  });

  ws.on("close", function incoming() {
    console.log(`Websocket client ${ws.id} disconnected`);
    game.leave(ws.id);
  });
});

// Game loop
function gameLoop() {
  const message = JSON.stringify({ status: "loop", clients: game.clients });

  for (const client of wss.clients) {
    client.send(message);
  }
}
setInterval(gameLoop, 1000);
