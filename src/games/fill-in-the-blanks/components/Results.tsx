import { Button } from '../../../components/ui/Button';

interface Props {
  solved: number;
  mistakes: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function Results({ solved, mistakes, onPlayAgain, onExit }: Props) {
  const { emoji, line } = grade(solved, mistakes);

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
      <div className="text-6xl">{emoji}</div>
      <h2 className="mt-4 text-2xl font-extrabold">{line}</h2>
      <p className="mt-2 text-white/60">
        You cracked <span className="font-bold text-white">{solved}</span>{' '}
        {solved === 1 ? 'cipher' : 'ciphers'}.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="rounded-2xl bg-white/5 px-5 py-4">
          <div className="text-3xl font-extrabold">{solved}</div>
          <div className="text-xs uppercase tracking-wide text-white/50">Solved</div>
        </div>
        <div className="rounded-2xl bg-white/5 px-5 py-4">
          <div className="text-3xl font-extrabold">{mistakes}</div>
          <div className="text-xs uppercase tracking-wide text-white/50">
            Wrong guesses
          </div>
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

function grade(solved: number, mistakes: number): { emoji: string; line: string } {
  if (mistakes === 0) return { emoji: '🏆', line: 'Perfect run!' };
  if (mistakes <= solved) return { emoji: '🎉', line: 'Great decoding!' };
  return { emoji: '🌱', line: 'Nicely done!' };
}
