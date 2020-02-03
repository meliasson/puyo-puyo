import React from "react";
import "./App.css";
import { initGame } from "./game";

class App extends React.Component {
  componentDidMount() {
    initGame();
  }

  render() {
    return (
      <div>
        <div id="start-view">
          <div id="header">
            <h1>A Puyo Puyo Clone!!!</h1>
          </div>
          <div id="footer">Press any key</div>
        </div>
        <div id="waiting-view" className="hidden">
          Waiting for opponent ...
        </div>
        <canvas id="running-view" className="hidden"></canvas>
      </div>
    );
  }
}

export default App;
