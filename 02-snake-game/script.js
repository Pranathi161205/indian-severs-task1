const boardEl = document.getElementById("board");
const rollBtn = document.getElementById("rollBtn");
const newGameBtn = document.getElementById("newGameBtn");
const diceEl = document.getElementById("dice");
const currentPlayerEl = document.getElementById("currentPlayer");
const messageEl = document.getElementById("message");
const playerOneScoreEl = document.getElementById("playerOneScore");
const playerTwoScoreEl = document.getElementById("playerTwoScore");

const WINNING_SQUARE = 100;
const SVG_NS = "http://www.w3.org/2000/svg";

const players = [
  { id: 1, name: "Player 1", position: 1 },
  { id: 2, name: "Player 2", position: 1 }
];

const ladders = {
  4: 25,
  13: 46,
  33: 49,
  42: 63,
  50: 69,
  62: 81,
  74: 92
};

const snakes = {
  27: 5,
  40: 3,
  43: 18,
  54: 31,
  66: 45,
  89: 53,
  99: 41
};

let currentPlayerIndex = 0;
let gameOver = false;

// Creates a traditional zig-zag board, with 1 at the bottom-left and 100 at the top-left.
function createBoard() {
  boardEl.innerHTML = "";

  for (let row = 9; row >= 0; row--) {
    const rowNumbers = [];

    for (let col = 1; col <= 10; col++) {
      rowNumbers.push(row * 10 + col);
    }

    if (row % 2 === 1) {
      rowNumbers.reverse();
    }

    rowNumbers.forEach((number) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.square = number;

      if (ladders[number]) {
        cell.classList.add("has-ladder");
      }

      if (snakes[number]) {
        cell.classList.add("has-snake");
      }

      cell.innerHTML = `
        <span class="cell-number">${number}</span>
        <div class="players" aria-label="Players on square ${number}"></div>
      `;

      boardEl.appendChild(cell);
    });
  }

  drawBoardMoves();
}

function renderPlayers() {
  document.querySelectorAll(".players").forEach((holder) => {
    holder.innerHTML = "";
  });

  players.forEach((player) => {
    const holder = document.querySelector(`[data-square="${player.position}"] .players`);
    const token = document.createElement("span");
    token.className = `token player-${player.id}`;
    token.textContent = player.id;
    token.title = player.name;
    holder.appendChild(token);
  });

  playerOneScoreEl.textContent = players[0].position;
  playerTwoScoreEl.textContent = players[1].position;
  currentPlayerEl.textContent = players[currentPlayerIndex].name;
}

function drawBoardMoves() {
  const overlay = createSvgElement("svg", {
    class: "move-overlay",
    viewBox: "0 0 100 100",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  });

  Object.entries(ladders).forEach(([start, end]) => {
    overlay.appendChild(createLadder(Number(start), end));
  });

  Object.entries(snakes).forEach(([start, end]) => {
    overlay.appendChild(createSnake(Number(start), end));
  });

  boardEl.appendChild(overlay);
}

function createLadder(start, end) {
  const startPoint = getSquarePoint(start);
  const endPoint = getSquarePoint(Number(end));
  const group = createSvgElement("g", { class: "ladder-line" });
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.hypot(dx, dy);
  const offsetX = (-dy / length) * 1.15;
  const offsetY = (dx / length) * 1.15;

  addLine(group, startPoint, endPoint, offsetX, offsetY, "rail");
  addLine(group, startPoint, endPoint, -offsetX, -offsetY, "rail");

  for (let step = 1; step <= 5; step++) {
    const t = step / 6;
    const center = {
      x: startPoint.x + dx * t,
      y: startPoint.y + dy * t
    };

    addLine(
      group,
      { x: center.x + offsetX, y: center.y + offsetY },
      { x: center.x - offsetX, y: center.y - offsetY },
      0,
      0,
      "rung"
    );
  }

  return group;
}

function createSnake(start, end) {
  const startPoint = getSquarePoint(start);
  const endPoint = getSquarePoint(Number(end));
  const group = createSvgElement("g", { class: "snake-line" });
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const curve = dx >= 0 ? 9 : -9;
  const head = createSvgElement("circle", {
    cx: startPoint.x,
    cy: startPoint.y,
    r: 2.2,
    class: "snake-head"
  });
  const eye = createSvgElement("circle", {
    cx: startPoint.x + 0.7,
    cy: startPoint.y - 0.5,
    r: 0.28,
    class: "snake-eye"
  });
  const path = createSvgElement("path", {
    d: `M ${startPoint.x} ${startPoint.y} C ${startPoint.x + curve} ${startPoint.y + dy * 0.28}, ${endPoint.x - curve} ${endPoint.y - dy * 0.28}, ${endPoint.x} ${endPoint.y}`,
    class: "snake-body"
  });

  group.appendChild(path);
  group.appendChild(head);
  group.appendChild(eye);

  return group;
}

function addLine(group, startPoint, endPoint, offsetX, offsetY, className) {
  group.appendChild(createSvgElement("line", {
    x1: startPoint.x + offsetX,
    y1: startPoint.y + offsetY,
    x2: endPoint.x + offsetX,
    y2: endPoint.y + offsetY,
    class: className
  }));
}

function getSquarePoint(square) {
  const rowFromBottom = Math.floor((square - 1) / 10);
  const indexInRow = (square - 1) % 10;
  const column = rowFromBottom % 2 === 0 ? indexInRow : 9 - indexInRow;

  return {
    x: column * 10 + 5,
    y: 100 - (rowFromBottom * 10 + 5)
  };
}

function createSvgElement(tagName, attributes) {
  const element = document.createElementNS(SVG_NS, tagName);

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  return element;
}

function rollDice() {
  if (gameOver) {
    return;
  }

  rollBtn.disabled = true;
  diceEl.classList.remove("rolling");

  const roll = Math.floor(Math.random() * 6) + 1;

  // Restarting the animation class makes every roll feel responsive.
  requestAnimationFrame(() => {
    diceEl.textContent = roll;
    diceEl.classList.add("rolling");
  });

  moveCurrentPlayer(roll);
}

function moveCurrentPlayer(roll) {
  const player = players[currentPlayerIndex];
  const target = player.position + roll;

  if (target > WINNING_SQUARE) {
    setMessage(`${player.name} rolled ${roll}, but needs an exact finish.`);
    endTurn(roll);
    return;
  }

  player.position = target;
  let message = `${player.name} rolled ${roll} and moved to ${target}.`;

  if (ladders[player.position]) {
    const oldPosition = player.position;
    player.position = ladders[player.position];
    message = `${player.name} climbed from ${oldPosition} to ${player.position}.`;
  }

  if (snakes[player.position]) {
    const oldPosition = player.position;
    player.position = snakes[player.position];
    message = `${player.name} slid from ${oldPosition} to ${player.position}.`;
  }

  renderPlayers();

  if (player.position === WINNING_SQUARE) {
    gameOver = true;
    rollBtn.disabled = true;
    setMessage(`${player.name} wins the game.`);
    return;
  }

  setMessage(message);
  endTurn(roll);
}

function endTurn(roll) {
  if (roll !== 6) {
    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
  } else {
    setMessage(`${players[currentPlayerIndex].name} rolled a 6 and gets another turn.`);
  }

  renderPlayers();
  rollBtn.disabled = false;
}

function newGame() {
  players[0].position = 1;
  players[1].position = 1;
  currentPlayerIndex = 0;
  gameOver = false;

  diceEl.textContent = "-";
  rollBtn.disabled = false;
  setMessage("Roll the dice to start the game.");
  renderPlayers();
}

function setMessage(message) {
  messageEl.textContent = message;
}

rollBtn.addEventListener("click", rollDice);
newGameBtn.addEventListener("click", newGame);

createBoard();
newGame();
