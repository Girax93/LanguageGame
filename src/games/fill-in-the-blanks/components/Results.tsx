import { Button } from '../../../components/ui/Button';

interface Props {
  score: number;
  total: number;
  bestStreak: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function Results({ score, total, bestStreak, onPlayAgain, onExit }: Props) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const { emoji, line } = grade(pct);

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
      <div className="text-6xl">{emoji}</div>
      <h2 className="mt-4 text-2xl font-extrabold">{line}</h2>
      <p className="mt-2 text-white/60">
        You got <span className="font-bold text-white">{score}</span> of{' '}
        <span className="font-bold text-white">{total}</span> correct.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="rounded-2xl bg-white/5 px-5 py-4">
          <div className="text-3xl font-extrabold">{pct}%</div>
          <div className="text-xs uppercase tracking-wide text-white/50">Score</div>
        </div>
        <div className="rounded-2xl bg-white/5 px-5 py-4">
          <div className="text-3xl font-extrabold">{bestStreak}🔥</div>
          <div className="text-xs uppercase tracking-wide text-white/50">Best streak</div>
        </div>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Button onClick={onPlayAgain}>Play again</Button>
        <Button variant="ghost" onClick={onExit}>
          Back to games
        </Button>
      </div>
    </div>
  );
}

function grade(pct: number): { emoji: string; line: string } {
  if (pct === 100) return { emoji: '🏆', line: 'Perfect!' };
  if (pct >= 80) return { emoji: '🎉', line: 'Great job!' };
  if (pct >= 50) return { emoji: '👍', line: 'Nicely done!' };
  return { emoji: '🌱', line: 'Keep practicing!' };
}
