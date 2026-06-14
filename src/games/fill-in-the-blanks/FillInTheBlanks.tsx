import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { CIPHER_ITEMS, type CipherContentItem } from '../../content/cipherItems';
import { isItemEligible } from '../../state/progression';
import { flagsForLevel } from '../../state/difficulty';
import { LevelStage } from '../_shared/LevelStage';
import { CipherBoard } from './components/CipherBoard';

export function FillInTheBlanks({ onExit, onOpenSettings }: GameProps) {
  const { state } = usePlayer();
  const items: CipherContentItem[] = CIPHER_ITEMS.filter((i) =>
    isItemEligible(i, state),
  ).sort((a, b) => a.level - b.level);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      renderBoard={(item, controls) => (
        <CipherBoard item={item} flags={flagsForLevel(item.level)} controls={controls} />
      )}
    />
  );
}
