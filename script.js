const board = document.querySelector('#board');
const diceDisplay = document.querySelector('#dice');
const statusText = document.querySelector('#status');
const rollBtn = document.querySelector('#rollBtn');

const boardSize = 100;
let playerPositions = [0, 0]; // Player 1 and Player 2
let currentPlayer = 0;

const get = (k, d) => JSON.parse(localStorage.getItem(`ludo-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`ludo-${k}`, JSON.stringify(v));

for (let i = boardSize; i >= 1; i--) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.id = `cell-${i}`;
  cell.innerText = i;
  board.appendChild(cell);
}

rollBtn.addEventListener('click', () => {
  const roll = Math.floor(Math.random() * 6) + 1;
  diceDisplay.textContent = `🎲 ${roll}`;

  movePlayer(currentPlayer, roll);
  
  if (playerPositions[currentPlayer] >= boardSize) {
    statusText.textContent = `Player ${currentPlayer + 1} wins! 🎉`;
    rollBtn.disabled = true;
    return;
  }

  currentPlayer = currentPlayer === 0 ? 1 : 0;
  statusText.textContent = `Player ${currentPlayer + 1}'s Turn`;
});

// function movePlayer(player, steps) {
//   if (playerPositions[player] > 0) {
//     document.querySelector(#cell-${playerPositions[player]}).classList.remove(p${player + 1});
//   }

//   playerPositions[player] += steps;
//   if (playerPositions[player] > boardSize) playerPositions[player] = boardSize;

//   document.querySelector(#cell-${playerPositions[player]}).classList.add(p${player + 1});
// }

function movePlayer(player, steps) {
  if (playerPositions[player] > 0) {
    document.getElementById(`cell-${playerPositions[player]}`).classList.remove(`p${player + 1}`);
  }

  playerPositions[player] += steps;
  if (playerPositions[player] > boardSize) playerPositions[player] = boardSize;

  document.getElementById(`cell-${playerPositions[player]}`).classList.add(`p${player + 1}`);
}

(e => {

})();