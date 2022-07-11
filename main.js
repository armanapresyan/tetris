const main = document.querySelector(".main");
const scoreElem = document.getElementById("score");
const levelElem = document.getElementById("level");
const nextElem = document.getElementById("next-figur");
const pauseBtn = document.getElementById("pauseBtn");
const startBtn = document.getElementById("startBtn");
const gameOver = document.getElementById("game-over");

let score = 0;
let currentLevel = 1;
let isPaused = true;
let gameTimerId;

let possibleLevels = {
  1: {
    scorePerLine: 10,
    speed: 400,
    nextLevelScore: 100,
  },
  2: {
    scorePerLine: 15,
    speed: 300,
    nextLevelScore: 500,
  },
  3: {
    scorePerLine: 20,
    speed: 200,
    nextLevelScore: 1000,
  },
  4: {
    scorePerLine: 30,
    speed: 100,
    nextLevelScore: 1500,
  },
  5: {
    scorePerLine: 50,
    speed: 50,
    nextLevelScore: Infinity,
  },
};

let board = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

let figures = {
  O: [
    [1, 1],
    [1, 1],
  ],
  I: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],

  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],

  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],

  L: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],

  J: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],

  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
};

let activFigur = getNewFigures();
let nextFigur = getNewFigures();

function drawBoard() {
  let mainInnerHTML = "";
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === 1) {
        mainInnerHTML += ' <div class="cell movingCell"></div>';
      } else if (board[y][x] === 2) {
        mainInnerHTML += ' <div class="cell fixedCell"></div>';
      } else {
        mainInnerHTML += ' <div class="cell"></div>';
      }
    }
  }
  main.innerHTML = mainInnerHTML;
}

function drowNextFigurs() {
  let nextFigurMainInnerHTML = "";
  for (let y = 0; y < nextFigur.shape.length; y++) {
    for (let x = 0; x < nextFigur.shape[y].length; x++) {
      if (nextFigur.shape[y][x]) {
        nextFigurMainInnerHTML += ' <div class="cell movingCell"></div>';
      } else {
        nextFigurMainInnerHTML += ' <div class="cell"></div>';
      }
    }
    nextFigurMainInnerHTML += "<br/>";
  }
  nextElem.innerHTML = nextFigurMainInnerHTML;
}

function removePresvActivFigur() {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === 1) {
        board[y][x] = 0;
      }
    }
  }
}

function addFigurs() {
  removePresvActivFigur();
  for (let y = 0; y < activFigur.shape.length; y++) {
    for (let x = 0; x < activFigur.shape[y].length; x++) {
      if (activFigur.shape[y][x] === 1) {
        board[activFigur.y + y][activFigur.x + x] = activFigur.shape[y][x];
      }
    }
  }
}

function rotateFigur() {
  const prevTetroState = activFigur.shape;

  activFigur.shape = activFigur.shape[0].map((val, index) =>
    activFigur.shape.map((row) => row[index]).reverse()
  );

  if (hasCollsions()) {
    activFigur.shape = prevTetroState;
  }
}

function hasCollsions() {
  for (let y = 0; y < activFigur.shape.length; y++) {
    for (let x = 0; x < activFigur.shape[y].length; x++) {
      if (
        activFigur.shape[y][x] &&
        (board[activFigur.y + y] === undefined ||
          board[activFigur.y + y][activFigur.x + x] === undefined ||
          board[activFigur.y + y][activFigur.x + x] === 2)
      ) {
        return true;
      }
    }
  }
  return false;
}

function moveDown() {
  activFigur.y += 1;
  if (hasCollsions()) {
    activFigur.y -= 1;
    fixdFigur();
    removeFullLines();
    activFigur = nextFigur;
    if (hasCollsions()) {
      reset();
    }
    nextFigur = getNewFigures();
  }
}

function reset() {
  isPaused = true;
  clearTimeout(gameTimerId);
  board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  possibleLevels = {
    1: {
      scorePerLine: 10,
      speed: 400,
      nextLevelScore: 100,
    },
    2: {
      scorePerLine: 15,
      speed: 300,
      nextLevelScore: 500,
    },
    3: {
      scorePerLine: 20,
      speed: 200,
      nextLevelScore: 1000,
    },
    4: {
      scorePerLine: 30,
      speed: 100,
      nextLevelScore: 1500,
    },
    5: {
      scorePerLine: 50,
      speed: 50,
      nextLevelScore: Infinity,
    },
  };

  drawBoard();
  gameOver.style.display = "block";
}

function removeFullLines() {
  let chekLine = true,
    filledLines = 0;
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] !== 2) {
        chekLine = false;
        break;
      }
    }
    if (chekLine) {
      board.splice(y, 1);
      board.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      filledLines++;
    }
    chekLine = true;
  }

  switch (filledLines) {
    case 1:
      score += possibleLevels[currentLevel].scorePerLine;
      break;
    case 2:
      score += possibleLevels[currentLevel].scorePerLine * 3;
      break;
    case 3:
      score += possibleLevels[currentLevel].scorePerLine * 6;
      break;
    case 4:
      score += possibleLevels[currentLevel].scorePerLine * 12;
      break;
  }

  scoreElem.innerHTML = score;

  if (score >= possibleLevels[currentLevel].nextLevelScore) {
    currentLevel++;
    levelElem.innerHTML = currentLevel;
  }
}

function getNewFigures() {
  const possibleFigures = "IOLJTSZ";
  const rand = Math.floor(Math.random() * 7);
  const newFigur = figures[possibleFigures[rand]];
  return {
    x: Math.floor((10 - newFigur[0].length) / 2),
    y: 0,
    shape: newFigur,
  };
}

function fixdFigur() {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === 1) {
        board[y][x] = 2;
      }
    }
  }
}

function dropFigur() {
  for (let y = activFigur.y; y < board.length; y++) {
    activFigur.y += 1;
    if (hasCollsions()) {
      activFigur.y -= 1;
      break;
    }
  }
}

window.addEventListener("keydown", function (e) {
  if (!isPaused) {
    if (e.key === "ArrowLeft") {
      activFigur.x -= 1;
      if (hasCollsions()) {
        activFigur.x += 1;
      }
    } else if (e.key === "ArrowRight") {
      activFigur.x += 1;
      if (hasCollsions()) {
        activFigur.x -= 1;
      }
    } else if (e.key === "ArrowDown") {
      moveDown();
    } else if (e.key === "ArrowUp") {
      rotateFigur();
    } else if (e.code === "Space") {
      dropFigur();
    }
    updateGameState();
  }
});

function updateGameState() {
  if (!isPaused) {
    addFigurs();
    drawBoard();
    drowNextFigurs();
  }
}

pauseBtn.addEventListener("click", function (e) {
  console.log(e.target.innerHTML);
  if (e.target.innerHTML === "Pause") {
    e.target.innerHTML = "Keep playing ...";
    clearTimeout(gameTimerId);
  } else {
    e.target.innerHTML = "Pause";
    gameTimerId = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
  isPaused = !isPaused;
  pauseBtn.blur();
});

startBtn.addEventListener("click", function (e) {
  e.target.innerHTML = "Start again";
  isPaused = false;
  gameTimerId = setTimeout(startGame, possibleLevels[currentLevel].speed);
  gameOver.style.display = "none";

  startBtn.blur();
});

scoreElem.innerHTML = score;
levelElem.innerHTML = currentLevel;

drawBoard();

function startGame() {
  moveDown();
  if (!isPaused) {
    updateGameState();

    gameTimerId = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
}
