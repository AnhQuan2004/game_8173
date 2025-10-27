interface GameOverlayProps {
  type: 'won' | 'over';
  onClose: () => void;
}

const GameOverlay = ({ type, onClose }: GameOverlayProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="text-center space-y-4 px-8">
        <h2 className="text-6xl font-bold text-white drop-shadow-2xl">
          {type === 'won' ? '🎉 Victory!' : '💀 Game Over'}
        </h2>
        <p className="text-2xl text-white/90">
          {type === 'won' ? '获得成就 "天才少年"' : '菜就多练'}
        </p>
        <p className="text-lg text-white/70">
          Click to continue
        </p>
      </div>
    </div>
  );
};

export default GameOverlay;
