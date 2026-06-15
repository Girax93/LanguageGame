import { useMemo } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { CIPHER_ITEMS, type CipherContentItem } from '../../content/cipherItems';
import { isItemEligible, isPracticeEligible } from '../../state/progression';
import { SETS } from '../../content/vocab';
import { flagsForLevel } from '../../state/difficulty';
import { withNewWordsFirst } from '../_shared/roundOrder';
import { LevelStage } from '../_shared/LevelStage';
import { CipherBoard } from './components/CipherBoard';

export function FillInTheBlanks({ onExit, onOpenSettings, onMain, scope = 'practice' }: GameProps) {
  const { state } = usePlayer();
  // Build the round ONCE per learned-word set (and scope), not on every render.
  // The focus clock ticks every second and re-renders this component; without
  // memoization the eligible list was re-shuffled each tick, which made the
  // puzzle flip mid-game.
  const items: CipherContentItem[] = useMemo(() => {
    const eligible = CIPHER_ITEMS.filter((i) =>
      scope === 'recap' ? isItemEligible(i, state) : isPracticeEligible(i, state, SETS),
    );
    return withNewWordsFirst(eligible, state.learnedWords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, scope]);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope !== 'recap'}
      renderBoard={(item, controls) => (
        <CipherBoard item={item} flags={flagsForLevel(item.level)} controls={controls} />
      )}
    />
  );
}
