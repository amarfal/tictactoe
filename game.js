const Gameboard = (() => {
  let cells = Array(9).fill("");

  const get = (i) => cells[i];
  const set = (i, mark) => { if (!cells[i]) cells[i] = mark; };
  const reset = () => { cells = Array(9).fill(""); };
  const isFull = () => cells.every(Boolean);
  const snapshot = () => cells.slice();

  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
  ];

  const winner = () => {
    for (const [a,b,c] of lines) {
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return { mark: cells[a], line:[a,b,c] };
      }
    }
    return null;
  };

  return { get, set, reset, isFull, snapshot, winner };
})();

const Player = (name, mark) => {
  let wins = 0;
  const getName = () => name || (mark === "X" ? "player one" : "player two");
  const setName = (n) => { name = n?.trim() || getName(); };
  const getMark = () => mark;
  const getWins = () => wins;
  const addWin = () => { wins += 1; };
  return { getName, setName, getMark, getWins, addWin };
};

const Game = (() => {
  const p1 = Player("player one", "X");
  const p2 = Player("player two", "O");
  let current = p1;
  let running = false;

  const start = (name1, name2) => {
    p1.setName(name1 || "player one");
    p2.setName(name2 || "player two");
    Gameboard.reset();
    current = p1;
    running = true;
    return state();
  };

  const restart = () => {
    Gameboard.reset();
    current = p1;
    running = true;
    return state();
  };

  const turn = () => current;
  const state = () => ({
    board: Gameboard.snapshot(),
    current: current.getMark(),
    p1: { name: p1.getName(), wins: p1.getWins(), mark: p1.getMark() },
    p2: { name: p2.getName(), wins: p2.getWins(), mark: p2.getMark() },
    running
  });

  const play = (index) => {
    if (!running) return { kind:"idle", ...state() };
    if (Gameboard.get(index)) return { kind:"blocked", ...state() };

    Gameboard.set(index, current.getMark());

    const win = Gameboard.winner();
    if (win) {
      running = false;
      (current === p1 ? p1 : p2).addWin();
      return { kind:"win", line: win.line, winner: current.getMark(), ...state() };
    }
    if (Gameboard.isFull()) {
      running = false;
      return { kind:"tie", ...state() };
    }

    // switch players
    current = (current === p1) ? p2 : p1;
    return { kind:"turn", ...state() };
  };

  return { start, restart, play, turn, state };
})();

const Display = (() => {
  // DOM refs
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const startBtn = document.getElementById("startBtn");
  const namesForm = document.getElementById("namesForm");
  const p1NameInput = document.getElementById("p1Name");
  const p2NameInput = document.getElementById("p2Name");
  const scoreBox = document.getElementById("score");
  const s1Name = document.getElementById("s1Name");
  const s2Name = document.getElementById("s2Name");
  const s1Wins = document.getElementById("s1Wins");
  const s2Wins = document.getElementById("s2Wins");

  // draw empty board cells
  const buildBoard = () => {
    boardEl.innerHTML = "";
    for (let i=0;i<9;i++){
      const c = document.createElement("button");
      c.className = "cell";
      c.type = "button";
      c.dataset.index = i;
      c.setAttribute("aria-label", `cell ${i+1}`);
      boardEl.appendChild(c);
    }
  };

  const render = (st) => {
    const { board, current, p1, p2 } = st;
    // cells
    [...boardEl.children].forEach((cell, i) => {
      cell.textContent = board[i] || "";
      cell.classList.toggle("disabled", !st.running || !!board[i]);
    });
    // scoreboard
    s1Name.textContent = p1.name;
    s2Name.textContent = p2.name;
    s1Wins.textContent = p1.wins;
    s2Wins.textContent = p2.wins;

    // status line
    if (st.kind === "win") {
      const winnerName = (st.winner === "X") ? p1.name : p2.name;
      const loserName  = (st.winner === "X") ? p2.name : p1.name;
      statusEl.textContent = `${winnerName} is a winner, ${loserName} you lose.`;
    } else if (st.kind === "tie") {
      statusEl.textContent = `it's a tie!`;
    } else if (st.running) {
      const name = (current === "X") ? p1.name : p2.name;
      statusEl.textContent = `${(current === "X" ? "x" : "o")}'s turn! (${name})`;
    } else {
      statusEl.textContent = "";
    }
  };

  // events
  boardEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".cell");
    if (!btn) return;
    const idx = +btn.dataset.index;
    const st = Game.play(idx);
    render(st);
  });

  startBtn.addEventListener("click", () => {
    if (startBtn.dataset.started !== "1") {
      // first start
      const st = Game.start(p1NameInput.value, p2NameInput.value);
      namesForm.classList.add("hidden");
      scoreBox.classList.remove("hidden");
      startBtn.textContent = "restart?";
      startBtn.dataset.started = "1";
      render({kind:"turn", ...st});
    } else {
      // restart board, keep wins
      const st = Game.restart();
      render({kind:"turn", ...st});
    }
  });

  // init
  buildBoard();
  statusEl.textContent = "";
  
})();
