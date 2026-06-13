import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { CIPHER_ITEMS, type CipherContentItem } from '../../content/cipherItems';
import { isItemEligible } from '../../state/progression';
import { flagsForLevel } from '../../state/difficulty';
import { LevelStage } from '../_shared/LevelStage';
import { CipherBoard } from './components/CipherBoard';

/**
 * Cipher mode. Only sentences whose required words are ALL mastered appear
 * (strict gating), ordered easy → hard. Difficulty flags come from the item's
 * derived level (which scales with how deep its words sit in the vocabulary).
 */
export function FillInTheBlanks({ onExit }: GameProps) {
  const { state } = usePlayer();
  const items: CipherContentItem[] = CIPHER_ITEMS.filter((i) =>
    isItemEligible(i, state),
  ).sort((a, b) => a.level - b.level);

  return (
    <LevelStage
      items={items}
      title="Letter Cipher"
      subtitle="Crack the code"
      onExit={onExit}
      renderBoard={(item, onResult) => (
        <CipherBoard item={item} flags={flagsForLevel(item.level)} onResult={onResult} />
      )}
    />
  );
}
