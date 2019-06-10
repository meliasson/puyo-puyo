import { scaleToWindow } from "./helpers";
import * as PIXI from "pixi.js";
import React from "react";

class Game extends React.Component {
  ws = new window.WebSocket(
    process.env.REACT_APP_WEBSOCKET_URL || `ws://${window.location.host}`
  );

  componentDidMount() {
    this.ws.onopen = () => {
      console.log("Websocket connected");
    };
    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      console.log("Websocket received message:", message);
    };

    document.addEventListener("keydown", event => {
      if (event.keyCode === 87) {
        this.ws.send(JSON.stringify({ action: "up" }));
      } else if (event.keyCode === 83) {
        this.ws.send(JSON.stringify({ action: "down" }));
      } else if (event.keyCode === 65) {
        this.ws.send(JSON.stringify({ action: "left" }));
      } else if (event.keyCode === 68) {
        this.ws.send(JSON.stringify({ action: "right" }));
      }
    });

    const app = new PIXI.Application({ width: 640, height: 360 });
    document.getElementById("root").appendChild(app.view);
    scaleToWindow(app.renderer.view);
  }

  render() {
    return null;
  }
}

export default Game;
