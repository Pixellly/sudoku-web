const table = document.getElementById('sudoku');
let initialPuzzle = [];
let currentGrid = [];

let secondsElapsed = 0;
let timerInterval;
let mistakeCount = 0;
const maxMistakes = 3;
let gameOver = false;

function startTimer() {
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    document.getElementById("timer").textContent =
      `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  document.getElementById("timer").textContent = "Time: 0:00";
}

function createGrid() {
  for (let row = 0; row < 9; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < 9; col++) {
      const td = document.createElement('td');
      td.contentEditable = true;

      td.addEventListener('input', (e) => {
        if (gameOver) {
          e.target.textContent = '';
          return;
        }

        const val = e.target.textContent;
        const match = val.match(/[1-9]/);
        const input = match ? match[0] : '';
        e.target.textContent = input;

        currentGrid[row][col] = input;

        if (input !== '' && solutionGrid[row][col] !== input) {
          mistakeCount++;
          document.getElementById("mistakes").textContent = `Mistakes: ${mistakeCount} / ${maxMistakes}`;
          td.style.backgroundColor = '#f88'; // red flash

          setTimeout(() => {
            td.style.backgroundColor = initialPuzzle[row][col] !== '' ? '#ddd' : 'white';
          }, 500);

          if (mistakeCount >= maxMistakes) {
            gameOver = true;
            alert("Game Over! You've made 3 mistakes.");
            startNewPuzzle();
          }
        }
      });

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function renderGrid(grid) {
  const cells = table.getElementsByTagName('td');
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const index = row * 9 + col;
      const td = cells[index];
      td.textContent = grid[row][col];
      const isClue = initialPuzzle[row][col] !== '';
      td.contentEditable = !isClue && !gameOver;
      td.style.backgroundColor = isClue ? '#ddd' : 'white';
    }
  }
}

function startNewPuzzle(){
  const full = generateFullBoard();
  const puzzle = makePuzzle(full, 45);
  initialPuzzle = JSON.parse(JSON.stringify(puzzle));
  currentGrid = JSON.parse(JSON.stringify(puzzle));
  solutionGrid = full;
  mistakeCount = 0;
  gameOver = false;
  document.getElementById("mistakes").textContent = `Mistakes: 0 / ${maxMistakes}`;
  resetTimer();
  startTimer();
  renderGrid(currentGrid);
}


function generateFullBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(''));

  function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (
        board[row][i] == num ||
        board[i][col] == num ||
        board[3 * Math.floor(row / 3) + Math.floor(i / 3)][3 * Math.floor(col / 3) + (i % 3)] == num
      ) {
        return false;
      }
    }
    return true;
  }

  function fill(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === '') {
          const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num.toString();
              if (fill(board)) return true;
              board[row][col] = '';
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fill(board);
  return board;
}

function makePuzzle(fullBoard, emptyCells = 45) {
  const puzzle = JSON.parse(JSON.stringify(fullBoard));
  let removed = 0;

  while (removed < emptyCells) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== '') {
      puzzle[row][col] = '';
      removed++;
    }
  }

  return puzzle;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Solve button
function solveSudoku() {
  const grid = JSON.parse(JSON.stringify(currentGrid));

  function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (
        grid[row][i] == num ||
        grid[i][col] == num ||
        grid[3 * Math.floor(row / 3) + Math.floor(i / 3)][3 * Math.floor(col / 3) + (i % 3)] == num
      ) {
        return false;
      }
    }
    return true;
  }

  function solve(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === '') {
          for (let num = 1; num <= 9; num++) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num.toString();
              if (solve(grid)) return true;
              grid[row][col] = '';
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  if (solve(grid)) {
    currentGrid = grid;
    renderGrid(grid);
  } else {
    alert("No solution found!");
  }
}

// Button: New
document.getElementById('new').addEventListener('click', startNewPuzzle);

// Button: Clear
document.getElementById('clear').addEventListener('click', () => {
  if (gameOver) return;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (initialPuzzle[row][col] === '') {
        currentGrid[row][col] = '';
      }
    }
  }
  renderGrid(currentGrid);
});

// Button: Solve
document.getElementById('solve').addEventListener('click', () => {
  solveSudoku();
});

// Init
createGrid();
const full = generateFullBoard();
const puzzle = makePuzzle(full, 45);
initialPuzzle = JSON.parse(JSON.stringify(puzzle));
currentGrid = JSON.parse(JSON.stringify(puzzle));
solutionGrid = full;
renderGrid(currentGrid);
resetTimer();
startTimer();
