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
    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell) {
          switch(cell) {
            case 1:
              context.fillStyle = "#404040";
              break;
            case 2:
              context.fillStyle = "#c0c0c0";
              break;
            case 3:
              context.fillStyle = "#808080";
              break;
            case 4:
              context.fillStyle = "#ffffff";
              break;
            default:
              context.fillStyle = "#ff0000";
          }
          context.fillRect(
            offsetX + columnIndex * squareSize,
            offsetY + rowIndex * squareSize,
            squareSize,
            squareSize
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
