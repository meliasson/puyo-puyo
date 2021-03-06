let canvas;
let context;
let state;
let ws;

function updateView(boards) {
  const size = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = size - (size % 16);
  canvas.height = size - (size % 16);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#222222";
  context.fillRect(0, 0, canvas.width, canvas.height);

  boards.forEach((board, index) => {
    const grid = board.grid;
    const squareSize = canvas.width / 16;
    const offsetX = (index * canvas.width) / 2 + squareSize;
    const offsetY = squareSize * 2;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;

    // Draw borders around the 12 * 6 grid.
    context.strokeRect(
      offsetX - 2,
      offsetY - 2,
      squareSize * 6 + 3,
      squareSize * 12 + 3
    );

    // Draw grid content.
    let colors;
    if (board.state === "gameOver") {
      colors = ["#404040", "#c0c0c0", "#808080", "#ffffff"];
    } else {
      colors = ["#ff48c4", "#2bd1fc", "#f3ea5f", "#c04df9", "#ff3f3f"]; // 80s
    }
    grid.forEach((row, rowIndex) => {
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

function replaceStartViewWithRunningView() {
  document.getElementById("start-view").classList.toggle("hidden");
  canvas = document.getElementById("running-view");
  canvas.classList.toggle("hidden");
  context = canvas.getContext("2d");
}

function replaceWaitingViewWithRunningView() {
  document.getElementById("waiting-view").classList.toggle("hidden");
  canvas = document.getElementById("running-view");
  canvas.classList.toggle("hidden");
  context = canvas.getContext("2d");
}

function replaceStartViewWithWaitingView() {
  document.getElementById("start-view").classList.toggle("hidden");
  document.getElementById("waiting-view").classList.toggle("hidden");
}

function initKeydownEventListener() {
  document.addEventListener("keydown", event => {
    if (state === "start") {
      connectToServer();
      return;
    }

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

function connectToServer() {
  ws = new window.WebSocket(
    process.env.REACT_APP_WEBSOCKET_URL || `wss://${window.location.host}`
  );

  ws.onopen = () => {
    console.log("Websocket opened");
  };

  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (state === "start" && message.status === "waitingForOpponent") {
      state = "waiting";
      replaceStartViewWithWaitingView();
    } else if (state === "start" && message.status === "loop") {
      state = "running";
      replaceStartViewWithRunningView();
      updateView(message.game.boards);
    } else if (state === "waiting" && message.status === "loop") {
      state = "running";
      replaceWaitingViewWithRunningView();
      updateView(message.game.boards);
    } else if (message.status === "loop") {
      updateView(message.game.boards);
    }
  };

  ws.onclose = event => {
    console.log("Websocket closed");
  };
}

export function initGame() {
  state = "start";
  initKeydownEventListener();
}
