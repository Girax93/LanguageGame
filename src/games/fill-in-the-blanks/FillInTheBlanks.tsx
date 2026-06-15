import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { CIPHER_ITEMS, type CipherContentItem } from '../../content/cipherItems';
import { isItemEligible } from '../../state/progression';
import { flagsForLevel } from '../../state/difficulty';
import { withNewWordsFirst } from '../_shared/roundOrder';
import { LevelStage } from '../_shared/LevelStage';
import { CipherBoard } from './components/CipherBoard';

export function FillInTheBlanks({ onExit, onOpenSettings, onMain }: GameProps) {
  const { state } = usePlayer();
  const items: CipherContentItem[] = withNewWordsFirst(
    CIPHER_ITEMS.filter((i) => isItemEligible(i, state)),
    state.learnedWords,
  );

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      renderBoard={(item, controls) => (
        <CipherBoard item={item} flags={flagsForLevel(item.level)} controls={controls} />
      )}
    />
  );
}
