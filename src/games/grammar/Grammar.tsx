import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { GRAMMAR_ITEMS, type GrammarContentItem } from '../../content/grammarItems';
import { isItemEligible } from '../../state/progression';
import { withNewWordsFirst } from '../_shared/roundOrder';
import { LevelStage } from '../_shared/LevelStage';
import { GrammarBoard } from './components/GrammarBoard';

export function Grammar({ onExit, onOpenSettings, onMain }: GameProps) {
  const { state } = usePlayer();
  const items: GrammarContentItem[] = withNewWordsFirst(
    GRAMMAR_ITEMS.filter((i) => isItemEligible(i, state)),
    state.learnedWords,
  );

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      renderBoard={(item, controls) => <GrammarBoard item={item} controls={controls} />}
    />
  );
}
