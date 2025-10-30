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

