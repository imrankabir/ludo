// const board = document.querySelector('#board');
// const diceDisplay = document.querySelector('#dice');
// const statusText = document.querySelector('#status');
// const rollBtn = document.querySelector('#rollBtn');

// const boardSize = 100;
// let playerPositions = [0, 0]; // Player 1 and Player 2
// let currentPlayer = 0;

const get = (k, d) => JSON.parse(localStorage.getItem(`ludo-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`ludo-${k}`, JSON.stringify(v));

// for (let i = boardSize; i >= 1; i--) {
//   const cell = document.createElement('div');
//   cell.classList.add('cell');
//   cell.id = `cell-${i}`;
//   cell.innerText = i;
//   board.appendChild(cell);
// }

// rollBtn.addEventListener('click', () => {
//   const roll = Math.floor(Math.random() * 6) + 1;
//   diceDisplay.textContent = `🎲 ${roll}`;

//   movePlayer(currentPlayer, roll);
  
//   if (playerPositions[currentPlayer] >= boardSize) {
//     statusText.textContent = `Player ${currentPlayer + 1} wins! 🎉`;
//     rollBtn.disabled = true;
//     return;
//   }

//   currentPlayer = currentPlayer === 0 ? 1 : 0;
//   statusText.textContent = `Player ${currentPlayer + 1}'s Turn`;
// });

// // function movePlayer(player, steps) {
// //   if (playerPositions[player] > 0) {
// //     document.querySelector(#cell-${playerPositions[player]}).classList.remove(p${player + 1});
// //   }

// //   playerPositions[player] += steps;
// //   if (playerPositions[player] > boardSize) playerPositions[player] = boardSize;

// //   document.querySelector(#cell-${playerPositions[player]}).classList.add(p${player + 1});
// // }

// function movePlayer(player, steps) {
//   if (playerPositions[player] > 0) {
//     document.getElementById(`cell-${playerPositions[player]}`).classList.remove(`p${player + 1}`);
//   }

//   playerPositions[player] += steps;
//   if (playerPositions[player] > boardSize) playerPositions[player] = boardSize;

//   document.getElementById(`cell-${playerPositions[player]}`).classList.add(`p${player + 1}`);
// }

const board = document.getElementById('game-board');
const scoreboard = document.getElementById('scoreboard');
const colors = ['red', 'green', 'blue', 'yellow'];
const piecesPerPlayer = 4;
const pathSteps = 56;
let diceValue = 0;
let currentTurnIndex = 0;
const playerStates = {};
const paths = {};

const socket = new WebSocket('ws://localhost:8090');

socket.onopen = () => console.log('✅ Connected to server');
socket.onmessage = event => {
  const data = JSON.parse(event.data);
  if (data.type === 'dice') {
    diceValue = data.value;
    console.log(`${data.color.toUpperCase()} rolled a ${diceValue}`);
  } else if (data.type === 'turn') {
    currentTurnIndex = data.turnIndex;
    updateTurnDisplay();
  } else if (data.type === 'move') {
    movePiece(data.color, data.index, data.step);
  }
};

function updateTurnDisplay() {
  document.getElementById('turn').textContent = `Current Turn: ${colors[currentTurnIndex].toUpperCase()}`;
}

function initPaths() {
  for (const color of colors) {
    paths[color] = [];
    for (let i = 0; i < pathSteps; i++) {
      paths[color].push({ x: (i % 14) * 40 + 20, y: Math.floor(i / 14) * 40 + 20 });
    }
  }
}

function movePiece(color, index, stepsToMove) {
  const piece = document.querySelector(`.piece[data-color='${color}'][data-index='${index}']`);
  const player = playerStates[color];
  const pieceState = player.pieces[index];

  if (!pieceState.started && stepsToMove === 6) {
    pieceState.started = true;
    pieceState.position = 0;
  } else if (pieceState.started) {
    pieceState.position += stepsToMove;
    if (pieceState.position >= pathSteps) {
      pieceState.finished = true;
      piece.style.display = 'none';
    }
  } else {
    return;
  }

  if (pieceState.started && !pieceState.finished) {
    const pos = paths[color][pieceState.position];
    piece.style.left = `${pos.x}px`;
    piece.style.top = `${pos.y}px`;
  }

  updateScore();
}

function updateScore() {
  let html = '';
  for (const color of colors) {
    const finished = playerStates[color].pieces.filter(p => p.finished).length;
    html += `<div>${color.toUpperCase()}: ${finished}/${piecesPerPlayer} pieces home</div>`;
  }
  scoreboard.innerHTML = html;
}

function createPiece(color, index, homePos) {
  const piece = document.createElement('div');
  piece.className = `piece ${color}`;
  piece.dataset.color = color;
  piece.dataset.index = index;
  piece.innerText = index + 1;
  piece.style.left = `${homePos.x}px`;
  piece.style.top = `${homePos.y}px`;
  board.appendChild(piece);

  piece.onclick = () => {
    if (colors[currentTurnIndex] !== color) return;
    socket.send(JSON.stringify({ type: 'move', color, index, step: diceValue }));
    const next = (currentTurnIndex + 1) % 4;
    socket.send(JSON.stringify({ type: 'turn', turnIndex: next }));
  };
}

function initPlayers() {
  for (const color of colors) {
    playerStates[color] = { pieces: [] };
    for (let i = 0; i < piecesPerPlayer; i++) {
      playerStates[color].pieces.push({ started: false, finished: false, position: -1 });
    }
  }
}

function initBoard() {
  const homePositions = {
    red: [ {x: 60, y: 60}, {x: 100, y: 60}, {x: 60, y: 100}, {x: 100, y: 100} ],
    green: [ {x: 460, y: 60}, {x: 500, y: 60}, {x: 460, y: 100}, {x: 500, y: 100} ],
    yellow: [ {x: 460, y: 460}, {x: 500, y: 460}, {x: 460, y: 500}, {x: 500, y: 500} ],
    blue: [ {x: 60, y: 460}, {x: 100, y: 460}, {x: 60, y: 500}, {x: 100, y: 500} ]
  };
  for (const color of colors) {
    homePositions[color].forEach((pos, i) => {
      createPiece(color, i, pos);
    });
  }
}

document.getElementById('dice').onclick = () => {
  const value = Math.floor(Math.random() * 6) + 1;
  diceValue = value;
  socket.send(JSON.stringify({ type: 'dice', value, color: colors[currentTurnIndex] }));
};


(e => {
    initPaths();
    initPlayers();
    initBoard();
    updateTurnDisplay();
    updateScore();
})();