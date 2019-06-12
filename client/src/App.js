import React from "react";
import "./App.css";
import { initGame } from "./game";

class App extends React.Component {
  componentDidMount() {
    initGame();
  }

  render() {
    return null;
  }
}

export default App;
