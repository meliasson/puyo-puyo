import * as PIXI from "pixi.js";
import { scaleToWindow } from "./helpers";
import tentacle from "./tentacle.png";

let app;
let ws;
let scale;

function initPixiJs() {
  app = new PIXI.Application({ width: 640, height: 360 });
  document.getElementById("root").appendChild(app.view);
  scale = scaleToWindow(app.renderer.view);

  app.loader.add("bunny", tentacle).load((loader, resources) => {
    // This creates a texture from a 'bunny.png' image
    const bunny = new PIXI.Sprite(resources.bunny.texture);

    bunny.width = app.renderer.width / 16;
    bunny.height = bunny.width; /* app.renderer.height / 9; */

    // Setup the position of the bunny
    bunny.x = bunny.width * 15;
    bunny.y = bunny.width * 8;

    // Rotate around the center
    bunny.anchor.x = 0;
    bunny.anchor.y = 0;

    // Add the bunny to the scene we are building
    app.stage.addChild(bunny);

    // Listen for frame updates
    app.ticker.add(() => {
      // each frame we spin the bunny around a bit
      /* bunny.rotation += 0.01; */
    });
  });
}

function initKeydownEventListener() {
  document.addEventListener("keydown", event => {
    if (event.keyCode === 87) {
      ws.send(JSON.stringify({ action: "up" }));
    } else if (event.keyCode === 83) {
      ws.send(JSON.stringify({ action: "down" }));
    } else if (event.keyCode === 65) {
      ws.send(JSON.stringify({ action: "left" }));
    } else if (event.keyCode === 68) {
      ws.send(JSON.stringify({ action: "right" }));
    }
  });
}

function initWebSocket() {
  ws = new window.WebSocket(
    process.env.REACT_APP_WEBSOCKET_URL || `ws://${window.location.host}`
  );

  ws.onopen = () => {
    console.log("Websocket connected");
  };

  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    console.log("Websocket received message:", message);
    if (message.status === "loop") {
      // TODO: Figure out how to render message.clients.
    }
  };
}

export function initGame() {
  initWebSocket();
  initKeydownEventListener();
  initPixiJs();
}
