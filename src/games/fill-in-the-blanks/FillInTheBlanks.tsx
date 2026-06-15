import { useMemo } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { CIPHER_ITEMS, type CipherContentItem } from '../../content/cipherItems';
import { isItemEligible, isPracticeEligible, practiceBlock, blockWords } from '../../state/progression';
import { SETS } from '../../content/vocab';
import { flagsForLevel } from '../../state/difficulty';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { CipherBoard } from './components/CipherBoard';

export function FillInTheBlanks({ onExit, onOpenSettings, onMain, scope = 'practice' }: GameProps) {
  const { state, recordCipherWords } = usePlayer();
  // Built once per learned-word set + scope (the focus clock mustn't reshuffle).
  // In Practice, sentences featuring not-yet-covered block words come first so
  // the player can finish the block's cipher coverage.
  const items: CipherContentItem[] = useMemo(() => {
    if (scope === 'recap') return shuffle(CIPHER_ITEMS.filter((i) => isItemEligible(i, state)));
    const eligible = CIPHER_ITEMS.filter((i) => isPracticeEligible(i, state, SETS));
    const bw = new Set(blockWords(SETS, practiceBlock(state, SETS)).map((w) => w.id));
    const covered = new Set(state.cipherWords ?? []);
    const uncovered = new Set([...bw].filter((id) => !covered.has(id)));
    const hits = (i: CipherContentItem) => i.requires.some((r) => uncovered.has(r));
    return [...shuffle(eligible.filter(hits)), ...shuffle(eligible.filter((i) => !hits(i)))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, scope]);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope !== 'recap'}
      onWin={scope === 'recap' ? undefined : (item) => recordCipherWords(item.requires)}
      renderBoard={(item, controls) => (
        <CipherBoard item={item} flags={flagsForLevel(item.level)} controls={controls} />
      )}
    />
  );
}
