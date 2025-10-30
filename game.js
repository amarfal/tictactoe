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