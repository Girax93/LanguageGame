import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { GRAMMAR_ITEMS, type GrammarContentItem } from '../../content/grammarItems';
import { isItemEligible } from '../../state/progression';
import { LevelStage } from '../_shared/LevelStage';
import { GrammarBoard } from './components/GrammarBoard';

export function Grammar({ onExit, onOpenSettings }: GameProps) {
  const { state } = usePlayer();
  const items: GrammarContentItem[] = GRAMMAR_ITEMS.filter((i) =>
    isItemEligible(i, state),
  ).sort((a, b) => a.level - b.level);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      renderBoard={(item, controls) => <GrammarBoard item={item} controls={controls} />}
    />
  );
}
