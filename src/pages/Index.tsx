import EarthBackground from '@/components/EarthBackground';
import GameBoard from '@/components/GameBoard';

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <EarthBackground />
      <GameBoard />
    </div>
  );
};

export default Index;
