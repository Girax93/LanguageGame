import { useMemo } from 'react';
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
  // Memoized so the per-second focus tick doesn't re-shuffle the round mid-game.
  const items: GrammarContentItem[] = useMemo(() => {
    const eligible = GRAMMAR_ITEMS.filter((i) =>
      scope === 'recap' ? isItemEligible(i, state) : isPracticeEligible(i, state, SETS),
    );
    return withNewWordsFirst(eligible, state.learnedWords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, scope]);

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
