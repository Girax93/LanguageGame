import { useMemo, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { SETS } from '../../content/vocab';
import {
  CROSSWORDS,
  crosswordItemsForBlock,
  type CrosswordContentItem,
} from '../../content/crosswords';
import {
  isItemEligible,
  currentBlock,
  crosswordSessionDone,
  isBlockComplete,
} from '../../state/progression';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { CrosswordBoard } from './components/CrosswordBoard';
import { Button } from '../../components/ui/Button';
import { ChevronLeft } from '../../components/ui/icons';

/**
 * German crossword.
 * - PRACTICE: this block's one crossword — the leftover words the cipher
 *   session couldn't place, padded with block nouns so they interlock.
 *   Solving it is the crossword part of the block's Practice gate.
 * - RECAP: free play across every block's crossword (does not gate).
 */
export function Crossword({ onExit, onOpenSettings, onMain, onLearn, onRecap, onPractice, scope = 'practice' }: GameProps) {
  const { state, recordCrosswordRound } = usePlayer();
  // Frozen at mount so the completion screen labels the block just practiced.
  const [block] = useState(() => currentBlock(state, SETS));

  const items: CrosswordContentItem[] = useMemo(() => {
    if (scope === 'recap') return shuffle(CROSSWORDS.filter((p) => isItemEligible(p, state)));
    const it = crosswordItemsForBlock(block);
    if (!it || !isItemEligible(it, state) || crosswordSessionDone(state, block)) return [];
    return [it];
    // Session is fixed when the screen opens; the solve updates the count, not the items.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, scope, block]);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope === 'practice'}
      onWin={scope === 'practice' ? () => recordCrosswordRound(block) : undefined}
      renderComplete={
        scope === 'practice'
          ? () => <CrosswordDone block={block} onExit={onExit} onLearn={onLearn} onRecap={onRecap} onPractice={onPractice} />
          : undefined
      }
      renderBoard={(item, controls) => <CrosswordBoard item={item} controls={controls} />}
    />
  );
}

/** Shown when the block's crossword is finished. If cipher + grammar are also
 *  done the block is complete; otherwise it points back to Practice. */
function CrosswordDone({
  block,
  onExit,
  onLearn,
  onRecap,
  onPractice,
}: {
  block: number;
  onExit: () => void;
  onLearn?: () => void;
  onRecap?: () => void;
  onPractice?: () => void;
}) {
  const { state } = usePlayer();
  if (isBlockComplete(state, SETS, block)) {
    return (
      <Done
        onExit={onExit}
        title="Block complete!"
        body="Every practice for this block is done — the next words are unlocked."
        primaryLabel="Learn more words"
        onPrimary={onLearn ?? onExit}
        secondaryLabel="Recap what you’ve learned"
        onSecondary={onRecap ?? onExit}
      />
    );
  }
  return (
    <Done
      onExit={onExit}
      title="Crossword done!"
      body="Keep going — finish this block’s other practice to unlock the next words."
      primaryLabel="Back to Practice"
      onPrimary={onPractice ?? onExit}
    />
  );
}

function Done({
  onExit,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  onExit: () => void;
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center">
        <button
          onClick={onExit}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
        >
          <ChevronLeft />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
        <div className="text-4xl text-brown">✓</div>
        <h2 className="mt-5 font-serif text-2xl font-semibold text-espresso">{title}</h2>
        <p className="mt-2 max-w-xs text-taupe">{body}</p>
        <Button className="mt-8 w-64" onClick={onPrimary}>
          {primaryLabel}
        </Button>
        {secondaryLabel && onSecondary && (
          <button
            onClick={onSecondary}
            className="mt-4 text-sm font-medium text-brown transition hover:text-espresso"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
