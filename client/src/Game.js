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
  }

  render() {
    return <div>Greetings from Game component!</div>;
  }
}

export default Game;
