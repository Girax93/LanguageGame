import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { PACKS } from '../../content/vocab';
import { CIPHER_ITEMS, type CipherContentItem } from '../../content/cipherItems';
import { isItemEligible } from '../../state/progression';
import { flagsForLevel } from '../../state/difficulty';
import { LevelStage } from '../_shared/LevelStage';
import { CipherBoard } from './components/CipherBoard';

/**
 * Cipher mode. Pulls only the cipher sentences whose pack the player has
 * already learned, ordered easy → hard, and runs them through the shared
 * focus/lives LevelStage. Difficulty flags come from each item's level.
 */
export function FillInTheBlanks({ onExit }: GameProps) {
  const { state } = usePlayer();
  const items: CipherContentItem[] = CIPHER_ITEMS.filter((i) =>
    isItemEligible(i, state, PACKS),
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
