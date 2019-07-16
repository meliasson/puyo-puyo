const port = process.env.PORT || 3100;

//
// Express
//

const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/build/index.html"))
);
app.get("/ping", (req, res) => res.json({ pong: "Pong!" }));

const expressServer = app.listen(port, () => {
  console.log(`Express listening on port ${port}`);
});

//
// Websocket
//

const uuidv1 = require("uuid/v1");
const WebSocket = require("ws");
const game = require("./game");

const wss = new WebSocket.Server({ server: expressServer });
console.log(`Websocket listening on port ${port}`);

/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["ws"] }] */
wss.on("connection", function connection(ws) {
  ws.id = uuidv1();
  console.log(`Websocket client ${ws.id} connected`);
  ws.game = game.join(ws);
  ws.send(JSON.stringify({ status: "connected", id: ws.id }));

  ws.on("message", function incoming(event) {
    console.log(`Websocket received message ${event} from client ${ws.id}`);
    const message = JSON.parse(event);
    ws.game.update(ws, message.action);
  });

  ws.on("close", function incoming() {
    console.log(`Websocket client ${ws.id} disconnected`);
    ws.game.leave(ws);
  });
});
