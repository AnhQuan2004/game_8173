type Direction = 'up' | 'down' | 'left' | 'right';

interface Tile {
  value: number;
  id: number;
}

type Grid = (Tile | null)[][];

const DIRS: Direction[] = ['up', 'right', 'down', 'left'];
const PROB_2 = 0.9;

function clone(grid: Grid): Grid {
  return grid.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

function rotateLeft(mat: Grid): Grid {
  const n = mat.length;
  const res: Grid = Array.from({ length: n }, () => Array(n).fill(null));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      res[n - 1 - j][i] = mat[i][j];
    }
  }
  return res;
}

function tryMove(grid: Grid, dir: Direction): { grid: Grid; scoreGain: number } | null {
  const size = 4;
  let moved = false;
  let scoreGain = 0;
  let newGrid = clone(grid);

  const rotateTimes: Record<Direction, number> = {
    left: 0,
    up: 1,
    right: 2,
    down: 3,
  };

  for (let r = 0; r < rotateTimes[dir]; r++) {
    newGrid = rotateLeft(newGrid);
  }

  for (let i = 0; i < size; i++) {
    const originalRow = newGrid[i].map(c => (c ? c.value : 0));
    let row = newGrid[i].filter(c => c) as Tile[];

    for (let j = 0; j < row.length - 1; j++) {
      if (row[j].value === row[j + 1].value) {
        row[j].value *= 2;
        scoreGain += row[j].value;
        row.splice(j + 1, 1);
      }
    }

    while (row.length < size) row.push(null as any);
    const newRowValues = row.map(c => (c ? c.value : 0));

    if (originalRow.some((v, idx) => v !== newRowValues[idx])) {
      moved = true;
    }

    newGrid[i] = row;
  }

  for (let r = 0; r < (4 - rotateTimes[dir]) % 4; r++) {
    newGrid = rotateLeft(newGrid);
  }

  return moved ? { grid: newGrid, scoreGain } : null;
}

function heuristic(grid: Grid): number {
  let empty = 0;
  let monotonic = 0;
  let maxTile = 0;

  for (let i = 0; i < 4; i++) {
    let prev = 0;
    for (let j = 0; j < 4; j++) {
      const cell = grid[i][j];
      if (!cell) {
        empty++;
        continue;
      }

      maxTile = Math.max(maxTile, cell.value);
      const v = Math.log2(cell.value);

      if (j > 0) {
        monotonic += v - prev;
      }
      prev = v;
    }
  }

  return empty * 1000 + maxTile + monotonic * 10;
}

function expectimaxRecursive(grid: Grid, depth: number): { score: number; dir?: Direction } {
  if (depth === 0) {
    return { score: heuristic(grid) };
  }

  let bestScore = -Infinity;
  let bestDir: Direction | undefined;

  for (const dir of DIRS) {
    const res = tryMove(grid, dir);
    if (!res) continue;

    const { grid: childGrid } = res;
    const expScore = chance(childGrid, depth - 1).score;

    if (expScore > bestScore) {
      bestScore = expScore;
      bestDir = dir;
    }
  }

  return { score: bestScore, dir: bestDir };
}

function chance(grid: Grid, depth: number): { score: number } {
  const empties: [number, number][] = [];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!grid[i][j]) empties.push([i, j]);
    }
  }

  if (!empties.length) {
    return { score: heuristic(grid) };
  }

  let total = 0;

  for (const [i, j] of empties) {
    for (const { value, prob } of [
      { value: 2, prob: PROB_2 },
      { value: 4, prob: 1 - PROB_2 },
    ]) {
      const g = clone(grid);
      g[i][j] = { value, id: 0 };
      total += prob * expectimaxRecursive(g, depth).score;
    }
  }

  return { score: total / empties.length };
}

export function expectimax(grid: Grid, depth: number): { dir?: Direction; score: number } {
  return expectimaxRecursive(grid, depth);
}
