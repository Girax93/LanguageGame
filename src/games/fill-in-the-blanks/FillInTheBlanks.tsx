import { useMemo, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { CIPHER_ITEMS, cipherItemsForBlock, type CipherContentItem } from '../../content/cipherItems';
import { isItemEligible, currentBlock, cipherRoundCount, isBlockComplete } from '../../state/progression';
import { SETS } from '../../content/vocab';
import { flagsForLevel } from '../../state/difficulty';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { RevealCard } from '../_shared/CompleteScreen';
import { CipherBoard } from './components/CipherBoard';

/**
 * Letter cipher (cryptogram).
 * - PRACTICE: the current block's bounded cipher session. Gates advancement.
 * - RECAP: free decoding across everything learned (does not gate).
 */
export function FillInTheBlanks({ onExit, onOpenSettings, onMain, onLearn, onRecap, onPractice, scope = 'practice' }: GameProps) {
  const { state, recordCipherRound } = usePlayer();
  // Frozen at mount so the completion screen labels the block just practiced.
  const [block] = useState(() => currentBlock(state, SETS));

  const items: CipherContentItem[] = useMemo(() => {
    if (scope === 'recap') return shuffle(CIPHER_ITEMS.filter((i) => isItemEligible(i, state)));
    return cipherItemsForBlock(block)
      .filter((i) => isItemEligible(i, state))
      .slice(cipherRoundCount(state, block));
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
      wordsForItem={(it) => it.requires}
      completeSpec={
        scope === 'practice'
          ? () =>
              isBlockComplete(state, SETS, block)
                ? {
                    title: 'Block complete!',
                    body: 'Every practice for this block is done — the next words are unlocked.',
                    primaryLabel: 'Learn more words',
                    onPrimary: onLearn ?? onExit,
                    secondaryLabel: 'Recap what you’ve learned',
                    onSecondary: onRecap ?? onExit,
                  }
                : {
                    title: 'Cipher done!',
                    body: 'Keep going — finish this block’s other practice to unlock the next words.',
                    primaryLabel: 'Back to Practice',
                    onPrimary: onPractice ?? onExit,
                  }
          : undefined
      }
      renderWin={(item) => <WinCard item={item} />}
      renderBoard={(item, controls) => (
        <CipherBoard item={item} flags={flagsForLevel(item.level)} controls={controls} />
      )}
    />
  );
}

function WinCard({ item }: { item: CipherContentItem }) {
  return <RevealCard primary={item.sentence} secondary={item.translation} />;
}
