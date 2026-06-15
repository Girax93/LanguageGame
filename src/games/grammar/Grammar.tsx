import { useMemo } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { GRAMMAR_ITEMS, type GrammarContentItem } from '../../content/grammarItems';
import {
  isItemEligible,
  isGrammarPracticeEligible,
  grammarNounId,
  practiceBlock,
  blockNouns,
} from '../../state/progression';
import { SETS } from '../../content/vocab';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { GrammarBoard } from './components/GrammarBoard';

export function Grammar({ onExit, onOpenSettings, onMain, scope = 'practice' }: GameProps) {
  const { state, recordGrammarNoun } = usePlayer();
  // Practice drills the current block's nouns; not-yet-drilled ones come first.
  const items: GrammarContentItem[] = useMemo(() => {
    if (scope === 'recap') return shuffle(GRAMMAR_ITEMS.filter((i) => isItemEligible(i, state)));
    const eligible = GRAMMAR_ITEMS.filter((i) => isGrammarPracticeEligible(i, state, SETS));
    const bn = new Set(blockNouns(SETS, practiceBlock(state, SETS)).map((w) => w.id));
    const covered = new Set(state.grammarWords ?? []);
    const undrilled = (i: GrammarContentItem) => {
      const n = grammarNounId(i);
      return !!n && bn.has(n) && !covered.has(n);
    };
    return [...shuffle(eligible.filter(undrilled)), ...shuffle(eligible.filter((i) => !undrilled(i)))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, scope]);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope !== 'recap'}
      onWin={scope === 'recap' ? undefined : (item) => recordGrammarNoun(grammarNounId(item))}
      renderBoard={(item, controls) => <GrammarBoard item={item} controls={controls} />}
    />
  );
}
