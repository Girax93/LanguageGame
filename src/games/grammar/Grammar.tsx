import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { GRAMMAR_ITEMS, type GrammarContentItem } from '../../content/grammarItems';
import { isItemEligible, isPracticeEligible } from '../../state/progression';
import { SETS } from '../../content/vocab';
import { withNewWordsFirst } from '../_shared/roundOrder';
import { LevelStage } from '../_shared/LevelStage';
import { GrammarBoard } from './components/GrammarBoard';

export function Grammar({ onExit, onOpenSettings, onMain, scope = 'practice' }: GameProps) {
  const { state } = usePlayer();
  const eligible = GRAMMAR_ITEMS.filter((i) =>
    scope === 'recap' ? isItemEligible(i, state) : isPracticeEligible(i, state, SETS),
  );
  const items: GrammarContentItem[] = withNewWordsFirst(eligible, state.learnedWords);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope !== 'recap'}
      renderBoard={(item, controls) => <GrammarBoard item={item} controls={controls} />}
    />
  );
}
