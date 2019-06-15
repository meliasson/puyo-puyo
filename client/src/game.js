let ws;
let canvas;
let context;

function updateView(boards) {
  const size = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = size - (size % 16);
  canvas.height = size - (size % 16);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  boards.forEach((board, index) => {
    const squareSize = canvas.width / 16;

    // Draw borders around the 12 * 6 board.
    context.lineWidth = 2;
    context.strokeStyle = "#FFFFFF";
    context.strokeRect(
      (index * canvas.width) / 2 + squareSize * 1 - 2,
      squareSize * 2 - 2,
      squareSize * 6 + 4,
      squareSize * 12 + 4
    );

    // TODO: Draw the not yet existing board content.
    /* context.fillStyle = "#FE4365";
     * const squareSize = canvas.width / 20;
     * context.fillRect(
     *   client.position[0] * squareSize,
     *   client.position[1] * squareSize,
     *   squareSize,
     *   squareSize
     * ); */
  });
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
    console.log("Websocket opened");
  };

  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.status === "loop") {
      updateView(message.game.boards);
    }
  };

  ws.onclose = event => {
    console.log("Websocket closed");
  };
}

export function initGame() {
  initWebSocket();
  initKeydownEventListener();
  initView();
}
