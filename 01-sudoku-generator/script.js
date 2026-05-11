const boardEl = document.getElementById("board");
const difficultyEl = document.getElementById("difficulty");
const messageEl = document.getElementById("message");
const newPuzzleBtn = document.getElementById("newPuzzleBtn");
const checkBtn = document.getElementById("checkBtn");
const clearBtn = document.getElementById("clearBtn");
const eraseBtn = document.getElementById("eraseBtn");
const numberButtons = document.querySelectorAll("[data-number]");

const SIZE = 9;
const BOX = 3;
const EMPTY = 0;
const difficultyBlanks = {
  easy: 36,
  medium: 46,
  hard: 56
};

let puzzle = [];
let solution = [];
let selectedCell = null;

// Build the interactive 9x9 grid once; values are updated per puzzle.
function createBoard() {
  boardEl.innerHTML = "";

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const input = document.createElement("input");
      input.className = "cell";
      input.type = "text";
      input.inputMode = "numeric";
      input.maxLength = "1";
      input.dataset.row = row;
      input.dataset.col = col;
      input.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);

      input.addEventListener("focus", () => selectCell(input));
      input.addEventListener("click", () => selectCell(input));
      input.addEventListener("keydown", handleKeyDown);
      input.addEventListener("input", handleCellInput);

      boardEl.appendChild(input);
    }
  }
}

function generateNewPuzzle() {
  const fullBoard = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  fillBoard(fullBoard);

  solution = copyBoard(fullBoard);
  puzzle = removeNumbers(copyBoard(fullBoard), difficultyBlanks[difficultyEl.value]);

  renderPuzzle();
  selectedCell = null;
  clearHighlights();
  setMessage("New puzzle ready. Pick a cell and start solving.");
}

// Recursive backtracking fills the grid with a complete valid Sudoku solution.
function fillBoard(grid) {
  const emptySpot = findEmptyCell(grid);

  if (!emptySpot) {
    return true;
  }

  const [row, col] = emptySpot;
  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of numbers) {
    if (isValidMove(grid, row, col, num)) {
      grid[row][col] = num;

      if (fillBoard(grid)) {
        return true;
      }

      grid[row][col] = EMPTY;
    }
  }

  return false;
}

function removeNumbers(grid, blanks) {
  const cells = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, index) => ({
      row: Math.floor(index / SIZE),
      col: index % SIZE
    }))
  );

  for (let i = 0; i < blanks && i < cells.length; i++) {
    const { row, col } = cells[i];
    grid[row][col] = EMPTY;
  }

  return grid;
}

function renderPuzzle() {
  const cells = getCells();

  cells.forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const value = puzzle[row][col];

    cell.value = value === EMPTY ? "" : String(value);
    cell.readOnly = value !== EMPTY;
    cell.className = "cell";

    if (value !== EMPTY) {
      cell.classList.add("fixed");
    }
  });
}

function selectCell(cell) {
  selectedCell = cell;
  highlightRelatedCells(cell);
}

function handleKeyDown(event) {
  const cell = event.target;

  if (cell.readOnly && /^[1-9]$|Backspace|Delete/.test(event.key)) {
    event.preventDefault();
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    updateCell(cell, "");
    return;
  }

  if (/^[1-9]$/.test(event.key)) {
    event.preventDefault();
    updateCell(cell, event.key);
    return;
  }

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    moveSelection(cell, event.key);
  }
}

function handleCellInput(event) {
  const cleanedValue = event.target.value.replace(/[^1-9]/g, "").slice(-1);
  updateCell(event.target, cleanedValue);
}

function updateCell(cell, value) {
  if (!cell || cell.readOnly) {
    return;
  }

  cell.value = value;
  cell.classList.remove("mistake");

  if (value && Number(value) !== getSolutionValue(cell)) {
    cell.classList.add("mistake");
    setMessage("That number does not fit this puzzle.");
  } else if (value) {
    setMessage("Good placement.");
  } else {
    setMessage("Cell cleared.");
  }

  highlightRelatedCells(cell);
}

function moveSelection(cell, key) {
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const next = {
    ArrowUp: [Math.max(0, row - 1), col],
    ArrowDown: [Math.min(SIZE - 1, row + 1), col],
    ArrowLeft: [row, Math.max(0, col - 1)],
    ArrowRight: [row, Math.min(SIZE - 1, col + 1)]
  }[key];

  getCell(next[0], next[1]).focus();
}

function highlightRelatedCells(cell) {
  clearHighlights();

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const startRow = Math.floor(row / BOX) * BOX;
  const startCol = Math.floor(col / BOX) * BOX;

  getCells().forEach((item) => {
    const itemRow = Number(item.dataset.row);
    const itemCol = Number(item.dataset.col);
    const inSameRow = itemRow === row;
    const inSameCol = itemCol === col;
    const inSameBox =
      itemRow >= startRow &&
      itemRow < startRow + BOX &&
      itemCol >= startCol &&
      itemCol < startCol + BOX;

    if (inSameBox) {
      item.classList.add("box-related");
    }

    if (inSameRow || inSameCol) {
      item.classList.add("related");
    }
  });

  cell.classList.add("selected");
}

function clearHighlights() {
  getCells().forEach((cell) => {
    cell.classList.remove("selected", "related", "box-related");
  });
}

function checkSolution() {
  let emptyCount = 0;
  let mistakeCount = 0;

  getCells().forEach((cell) => {
    if (!cell.value) {
      emptyCount++;
      return;
    }

    if (Number(cell.value) !== getSolutionValue(cell)) {
      cell.classList.add("mistake");
      mistakeCount++;
    } else if (!cell.readOnly) {
      cell.classList.remove("mistake");
    }
  });

  if (mistakeCount > 0) {
    setMessage(`${mistakeCount} mistake${mistakeCount === 1 ? "" : "s"} found. Red cells need another try.`);
  } else if (emptyCount > 0) {
    setMessage(`No mistakes so far. ${emptyCount} cell${emptyCount === 1 ? "" : "s"} left.`);
  } else {
    setMessage("Solved perfectly. Nice work.");
  }
}

function clearUserEntries() {
  getCells().forEach((cell) => {
    if (!cell.readOnly) {
      cell.value = "";
      cell.classList.remove("mistake");
    }
  });

  if (selectedCell) {
    highlightRelatedCells(selectedCell);
  }

  setMessage("Your entries were cleared. Fixed clues stayed in place.");
}

function enterNumber(number) {
  if (!selectedCell) {
    setMessage("Select an empty cell first.");
    return;
  }

  updateCell(selectedCell, number);
  selectedCell.focus();
}

function eraseSelectedCell() {
  if (!selectedCell) {
    setMessage("Select a cell to erase.");
    return;
  }

  updateCell(selectedCell, "");
  selectedCell.focus();
}

function isValidMove(grid, row, col, num) {
  for (let index = 0; index < SIZE; index++) {
    if (grid[row][index] === num || grid[index][col] === num) {
      return false;
    }
  }

  const startRow = Math.floor(row / BOX) * BOX;
  const startCol = Math.floor(col / BOX) * BOX;

  for (let r = startRow; r < startRow + BOX; r++) {
    for (let c = startCol; c < startCol + BOX; c++) {
      if (grid[r][c] === num) {
        return false;
      }
    }
  }

  return true;
}

function findEmptyCell(grid) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (grid[row][col] === EMPTY) {
        return [row, col];
      }
    }
  }

  return null;
}

function getSolutionValue(cell) {
  return solution[Number(cell.dataset.row)][Number(cell.dataset.col)];
}

function getCell(row, col) {
  return boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function getCells() {
  return Array.from(document.querySelectorAll(".cell"));
}

function copyBoard(grid) {
  return grid.map((row) => [...row]);
}

function shuffle(items) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function setMessage(text) {
  messageEl.textContent = text;
}

newPuzzleBtn.addEventListener("click", generateNewPuzzle);
checkBtn.addEventListener("click", checkSolution);
clearBtn.addEventListener("click", clearUserEntries);
eraseBtn.addEventListener("click", eraseSelectedCell);
difficultyEl.addEventListener("change", generateNewPuzzle);

numberButtons.forEach((button) => {
  button.addEventListener("click", () => enterNumber(button.dataset.number));
});

createBoard();
generateNewPuzzle();
