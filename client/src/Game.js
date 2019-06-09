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
  }

  render() {
    return <div>Greetings from Game component!</div>;
  }
}

export default Game;
