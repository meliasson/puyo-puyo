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
    const offsetX = (index * canvas.width) / 2 + squareSize;
    const offsetY = squareSize * 2;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;

    // Draw borders around the 12 * 6 board.
    context.strokeRect(
      offsetX - 2,
      offsetY - 2,
      squareSize * 6 + 4,
      squareSize * 12 + 4
    );

    // Draw board content.
    // const colors = ["#404040", "#c0c0c0", "#808080", "#ffffff"];
    // const colors = ["#ECE59A", "#FD6E8A", "#848D82", "#2C3B63"];
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"];
    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell) {
          context.fillStyle = colors[cell - 1];
          context.fillRect(
            offsetX + columnIndex * squareSize,
            offsetY + rowIndex * squareSize,
            squareSize - 1,
            squareSize - 1
          );
        }
      });
    });
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
      ws.send(JSON.stringify({ action: "rotate" }));
    } else if (event.keyCode === 83) {
      ws.send(JSON.stringify({ action: "drop" }));
    } else if (event.keyCode === 65) {
      ws.send(JSON.stringify({ action: "left" }));
    } else if (event.keyCode === 68) {
      ws.send(JSON.stringify({ action: "right" }));
    }
  });
}

function initWebSocket() {
  ws = new window.WebSocket(
    process.env.REACT_APP_WEBSOCKET_URL || `wss://${window.location.host}`
  );

  ws.onopen = () => {
    console.log("Websocket opened");
  };

  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    console.log("Received message from server", message);
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
