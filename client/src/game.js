let ws;
let canvas;
let context;

function updateView(clients) {
  const size = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = size - (size % 8);
  canvas.height = size - (size % 8);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#303030";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const clientId in clients) {
    const client = clients[clientId];
    context.fillStyle = "#FE4365";
    const squareSize = canvas.width / 8;
    context.fillRect(
      client.position[0] * squareSize,
      client.position[1] * squareSize,
      squareSize,
      squareSize
    );
  }
}

function initView() {
  canvas = document.createElement("canvas");
  document.getElementById("root").appendChild(canvas);
  context = canvas.getContext("2d");
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
    if (message.status === "loop") {
      updateView(message.clients);
    }
  };
}

export function initGame() {
  initWebSocket();
  initKeydownEventListener();
  initView();
}
