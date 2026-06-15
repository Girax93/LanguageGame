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
  const eligible = CIPHER_ITEMS.filter((i) =>
    scope === 'recap' ? isItemEligible(i, state) : isPracticeEligible(i, state, SETS),
  );
  const items: CipherContentItem[] = withNewWordsFirst(eligible, state.learnedWords);

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
