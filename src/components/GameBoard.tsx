import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import GameTile from './GameTile';
import GameOverlay from './GameOverlay';
import { expectimax } from '@/lib/gameAI';

interface Tile {
  value: number;
  id: number;
}

type Grid = (Tile | null)[][];

const GameBoard = () => {
  const [grid, setGrid] = useState<Grid>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const idCounter = useRef(0);
  const aiInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedBest = localStorage.getItem('best8192');
    if (savedBest) setBest(parseInt(savedBest));
    resetGame();
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem('best8192', score.toString());
    }
  }, [score, best]);

  const createEmptyGrid = (): Grid => {
    return Array.from({ length: 4 }, () => Array(4).fill(null));
  };

  const addRandomTile = (currentGrid: Grid): Grid => {
    const empties: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (!currentGrid[i][j]) empties.push([i, j]);
      }
    }
    if (!empties.length) return currentGrid;

    const [row, col] = empties[Math.floor(Math.random() * empties.length)];
    const newGrid = currentGrid.map(r => [...r]);
    newGrid[row][col] = {
      value: Math.random() < 0.9 ? 2 : 4,
      id: ++idCounter.current,
    };
    return newGrid;
  };

  const resetGame = () => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setWon(false);
    setGameOver(false);
  };

  const slide = (row: (Tile | null)[]): (Tile | null)[] => {
    let filtered = row.filter(cell => cell);
    let scoreGain = 0;
    
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i]!.value === filtered[i + 1]!.value) {
        filtered[i] = { ...filtered[i]!, value: filtered[i]!.value * 2 };
        scoreGain += filtered[i]!.value;
        filtered.splice(i + 1, 1);
      }
    }
    
    setScore(prev => prev + scoreGain);
    while (filtered.length < 4) filtered.push(null);
    return filtered;
  };

  const transpose = (grid: Grid): Grid => {
    return grid[0].map((_, i) => grid.map(row => row[i]));
  };

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setGrid(prevGrid => {
      let newGrid = prevGrid.map(row => [...row]);
      const before = JSON.stringify(newGrid);

      switch (direction) {
        case 'left':
          newGrid = newGrid.map(row => slide(row));
          break;
        case 'right':
          newGrid = newGrid.map(row => slide([...row].reverse()).reverse());
          break;
        case 'up':
          newGrid = transpose(newGrid);
          newGrid = newGrid.map(row => slide(row));
          newGrid = transpose(newGrid);
          break;
        case 'down':
          newGrid = transpose(newGrid);
          newGrid = newGrid.map(row => slide([...row].reverse()).reverse());
          newGrid = transpose(newGrid);
          break;
      }

      if (JSON.stringify(newGrid) !== before) {
        newGrid = addRandomTile(newGrid);
        checkStatus(newGrid);
        return newGrid;
      }
      return prevGrid;
    });
  }, []);

  const checkStatus = (currentGrid: Grid) => {
    const hasWon = currentGrid.flat().some(tile => tile && tile.value === 8192);
    if (hasWon && !won) {
      setWon(true);
    }

    if (!movesAvailable(currentGrid)) {
      setGameOver(true);
      stopAI();
    }
  };

  const movesAvailable = (currentGrid: Grid): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!currentGrid[r][c]) return true;
        
        const val = currentGrid[r][c]!.value;
        if (r < 3 && currentGrid[r + 1][c] && currentGrid[r + 1][c]!.value === val) return true;
        if (c < 3 && currentGrid[r][c + 1] && currentGrid[r][c + 1]!.value === val) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const dirs: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      if (dirs[e.key]) {
        e.preventDefault();
        move(dirs[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  useEffect(() => {
    let startX: number | null = null;
    let startY: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (startX === null || startY === null) return;

      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        move(deltaX > 0 ? 'right' : 'left');
      } else {
        move(deltaY > 0 ? 'down' : 'up');
      }

      startX = startY = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [move]);

  const runAIStep = () => {
    const result = expectimax(grid, 3);
    if (result.dir) {
      move(result.dir);
    }
  };

  const toggleAI = () => {
    if (aiRunning) {
      stopAI();
    } else {
      startAI();
    }
  };

  const startAI = () => {
    setAiRunning(true);
    aiInterval.current = setInterval(runAIStep, 75);
  };

  const stopAI = () => {
    setAiRunning(false);
    if (aiInterval.current) {
      clearInterval(aiInterval.current);
      aiInterval.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (aiInterval.current) clearInterval(aiInterval.current);
    };
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-bold text-foreground">8192</h1>
          <div className="flex gap-4">
            <div className="bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground">SCORE</div>
              <div className="text-2xl font-bold text-foreground">{score}</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground">BEST</div>
              <div className="text-2xl font-bold text-primary">{best}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <Button onClick={resetGame} className="flex-1">
            New Game
          </Button>
          <Button 
            onClick={toggleAI} 
            variant={aiRunning ? "destructive" : "secondary"}
            className="flex-1"
          >
            {aiRunning ? 'Stop AI' : 'AI Auto'}
          </Button>
        </div>

        <div className="relative bg-card/60 backdrop-blur-md p-4 rounded-2xl border-2 border-border shadow-2xl">
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted/40 rounded-lg"
              />
            ))}
          </div>

          <div className="absolute inset-4 pointer-events-none">
            {grid.map((row, i) =>
              row.map((tile, j) =>
                tile ? (
                  <GameTile
                    key={tile.id}
                    value={tile.value}
                    row={i}
                    col={j}
                  />
                ) : null
              )
            )}
          </div>
        </div>

        <div className="text-center mt-4 text-muted-foreground text-sm">
          Use arrow keys or WASD to play
        </div>
      </div>

      {won && <GameOverlay type="won" onClose={() => setWon(false)} />}
      {gameOver && <GameOverlay type="over" onClose={resetGame} />}
    </div>
  );
};

export default GameBoard;
