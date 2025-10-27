import { useEffect, useState, useRef } from 'react';

interface GameTileProps {
  value: number;
  row: number;
  col: number;
}

const GameTile = ({ value, row, col }: GameTileProps) => {
  const [mounted, setMounted] = useState(false);
  const [merged, setMerged] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (prevValue.current !== value) {
      setMerged(true);
      const timer = setTimeout(() => setMerged(false), 100);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  const getTileColor = (val: number) => {
    const colors: Record<number, string> = {
      2: 'hsl(var(--tile-2))',
      4: 'hsl(var(--tile-4))',
      8: 'hsl(var(--tile-8))',
      16: 'hsl(var(--tile-16))',
      32: 'hsl(var(--tile-32))',
      64: 'hsl(var(--tile-64))',
      128: 'hsl(var(--tile-128))',
      256: 'hsl(var(--tile-256))',
      512: 'hsl(var(--tile-512))',
      1024: 'hsl(var(--tile-1024))',
      2048: 'hsl(var(--tile-2048))',
      4096: 'hsl(var(--tile-4096))',
      8192: 'hsl(var(--tile-8192))',
    };
    return colors[val] || 'hsl(var(--accent))';
  };

  const getTextSize = (val: number) => {
    if (val >= 1024) return 'text-2xl';
    if (val >= 128) return 'text-3xl';
    return 'text-4xl';
  };

  const cellSize = 'calc((100% - 2.25rem) / 4)';
  const gap = '0.75rem';
  const position = {
    left: `calc(${col} * (${cellSize} + ${gap}))`,
    top: `calc(${row} * (${cellSize} + ${gap}))`,
  };

  return (
    <div
      className={`absolute w-[calc((100%-2.25rem)/4)] aspect-square rounded-lg flex items-center justify-center font-bold text-white shadow-lg transition-all duration-200 ${
        mounted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      } ${merged ? 'scale-110' : ''} ${getTextSize(value)}`}
      style={{
        ...position,
        backgroundColor: getTileColor(value),
        boxShadow: value >= 8192 
          ? '0 0 40px hsl(var(--tile-8192) / 0.8), 0 4px 12px hsl(225 70% 5% / 0.5)'
          : value >= 2048
          ? '0 0 20px hsl(var(--tile-2048) / 0.6), 0 4px 12px hsl(225 70% 5% / 0.5)'
          : '0 4px 12px hsl(225 70% 5% / 0.5)',
      }}
    >
      {value}
    </div>
  );
};

export default GameTile;
