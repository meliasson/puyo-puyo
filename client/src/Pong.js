import React from "react";

class Pong extends React.Component {
  componentDidMount() {
    fetch("/ping")
      .then(response => {
        console.log(response);
        return response.json();
      })
      .then(pong => {
        console.log(pong);
      });
  }

  render() {
    return <div>Greetings from Pong component!</div>;
  }
}

export default Pong;
