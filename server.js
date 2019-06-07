const port = process.env.PORT || 3100;

// Express
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Hello, World!"));
app.get("/ping", (req, res) => res.json({ pong: "Pong!" }));
const expressServer = app.listen(port, () => {
  console.log(`Express listening on port ${port}`);
});

// Websocket
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server: expressServer });
console.log(`Websocket listening on port ${port}`);
wss.on("connection", function connection(ws) {
  console.log(`Websocket client connected`);
  ws.send(JSON.stringify({ status: "connected" }));

  ws.on("message", function incoming(event) {
    console.log(`Websocket client sent messaget ${event}`);
    const message = JSON.parse(event);
  });

  ws.on("close", function incoming() {
    console.log(`Websocket client disconnected`);
  });
});
