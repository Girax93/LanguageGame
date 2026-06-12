import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { PACKS } from '../../content/vocab';
import { GRAMMAR_ITEMS, type GrammarContentItem } from '../../content/grammarItems';
import { isItemEligible } from '../../state/progression';
import { LevelStage } from '../_shared/LevelStage';
import { GrammarBoard } from './components/GrammarBoard';

/**
 * Grammar mode. Same focus/lives flow as cipher, but the puzzle is an
 * article-ending recall drill. Only items whose pack is learned appear.
 */
export function Grammar({ onExit }: GameProps) {
  const { state } = usePlayer();
  const items: GrammarContentItem[] = GRAMMAR_ITEMS.filter((i) =>
    isItemEligible(i, state, PACKS),
  ).sort((a, b) => a.level - b.level);

  return (
    <LevelStage
      items={items}
      title="Grammar"
      subtitle="Article endings"
      onExit={onExit}
      renderBoard={(item, onResult) => <GrammarBoard item={item} onResult={onResult} />}
    />
  );
}
