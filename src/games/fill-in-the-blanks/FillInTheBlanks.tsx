import { useState } from 'react';
import type { GameProps } from '../types';
import type { CipherDeck } from './types';
import { germanA1 } from './data/german-a1';
import { shuffle } from '../../lib/array';
import { StatPill } from '../../components/ui/StatPill';
import { CipherBoard } from './components/CipherBoard';
import { Results } from './components/Results';

const deck: CipherDeck = germanA1;

/**
 * Number-cipher (cryptogram) game. Each puzzle is a German sentence shown
 * as numbered letter slots; the player decodes it one slot at a time using
 * the on-screen German keyboard. This is the "fill-in-the-blanks" module in
 * the registry.
 */
export function FillInTheBlanks({ onExit }: GameProps) {
  const [order, setOrder] = useState(() => shuffle(deck.items));
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = order.length;
  const current = order[index];

  function handleNext(puzzleMistakes: number) {
    setMistakes((m) => m + puzzleMistakes);
    if (index + 1 >= total) setFinished(true);
    else setIndex((i) => i + 1);
  }

  function restart() {
    setOrder(shuffle(deck.items));
    setIndex(0);
    setMistakes(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <Results
        solved={total}
        mistakes={mistakes}
        onPlayAgain={restart}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Back to games"
        >
          ←
        </button>
        <StatPill icon="🔓" label="" value={`${index + 1} / ${total}`} />
      </div>

      <div className="mb-1 text-center">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300/70">
          Letter Cipher
        </h2>
        <p className="text-xs text-white/40">{deck.name} · crack the code</p>
      </div>

      <CipherBoard
        key={current.id}
        item={current}
        onNext={handleNext}
        isLast={index + 1 >= total}
      />
    </div>
  );
}
