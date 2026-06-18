import { useMemo, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { CIPHER_ITEMS, cipherItemsForBlock, type CipherContentItem } from '../../content/cipherItems';
import { isItemEligible, currentBlock, cipherRoundCount, blockPracticeDone } from '../../state/progression';
import { SETS } from '../../content/vocab';
import { flagsForLevel } from '../../state/difficulty';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { CipherBoard } from './components/CipherBoard';
import { Button } from '../../components/ui/Button';
import { ChevronLeft } from '../../components/ui/icons';

/**
 * Letter cipher (cryptogram).
 * - PRACTICE: the current block's bounded cipher session — the generated
 *   sentences that together cover the block's newly-learned words. Completing
 *   them is the cipher half of the block's Practice gate (it resumes where the
 *   player left off). Gates advancement.
 * - RECAP: free decoding across everything learned (does not gate).
 */
export function FillInTheBlanks({ onExit, onOpenSettings, onMain, onLearn, onRecap, onPractice, scope = 'practice' }: GameProps) {
  const { state, recordCipherRound } = usePlayer();
  // Frozen at mount so the completion screen labels the block just practiced
  // (currentBlock advances the instant the block completes).
  const [block] = useState(() => currentBlock(state, SETS));

  const items: CipherContentItem[] = useMemo(() => {
    if (scope === 'recap') return shuffle(CIPHER_ITEMS.filter((i) => isItemEligible(i, state)));
    // Resume the block's session from the first not-yet-solved sentence. Filter to
    // eligible items so a sentence never shows a word the player hasn't learned yet
    // (only matters if Practice is opened before the block is fully learned).
    return cipherItemsForBlock(block)
      .filter((i) => isItemEligible(i, state))
      .slice(cipherRoundCount(state, block));
    // Session is fixed when the screen opens; each solve updates the count, not the items.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, scope, block]);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope === 'practice'}
      onWin={scope === 'practice' ? () => recordCipherRound(block) : undefined}
      renderComplete={
        scope === 'practice'
          ? () => <CipherDone block={block} onExit={onExit} onLearn={onLearn} onRecap={onRecap} onPractice={onPractice} />
          : undefined
      }
      renderWin={(item) => (
        <div className="mt-3 w-full max-w-xs rounded-xl border border-line bg-sand/40 px-4 py-3 text-center">
          <p className="font-serif text-lg font-semibold text-espresso">{item.sentence}</p>
          <p className="mt-1 text-sm text-taupe">{item.translation}</p>
        </div>
      )}
      renderBoard={(item, controls) => (
        <CipherBoard item={item} flags={flagsForLevel(item.level)} controls={controls} />
      )}
    />
  );
}

/** Shown when the block's cipher session is finished. If grammar is also done
 *  the block is complete; otherwise it points the player at grammar. */
function CipherDone({
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
  const blockDone = blockPracticeDone(state, block); // grammar half (cipher just finished)
  if (blockDone) {
    return (
      <Done
        onExit={onExit}
        title="Block complete!"
        body="Cipher and grammar done — the next words are unlocked."
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
      title="Cipher done!"
      body="Now finish this block’s Grammar to unlock the next words."
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
