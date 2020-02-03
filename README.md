# Puyo Puyo

A multiplayer Puyo Puyo clone, where the backend is built with [WebSocket](https://en.wikipedia.org/wiki/WebSocket) and [Express](https://expressjs.com/), and the frontend with [Create React App](https://create-react-app.dev/) and the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).

## Run game

Clone the repository and then start the server by, in the `/server` directory, executing:


```
$ npm install && npm start
```

Then start a client by, in the `/client` directory, executing:

```
$ REACT_APP_WEBSOCKET_URL=ws://localhost:<port> && npm install && npm start
```

## Development TODOs

* Add gameplay instructions.
* Add a game lobby.
* Record statistics and show them when game ends. For example the total number of actions and the number of exploded n-chains.
* Add AI opponents.
