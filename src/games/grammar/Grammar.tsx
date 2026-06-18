import { useMemo } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { GRAMMAR_ITEMS, type GrammarContentItem } from '../../content/grammarItems';
import { isItemEligible, currentBlock, practiceNounsForBlock, grammarNounId } from '../../state/progression';
import { SETS } from '../../content/vocab';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { GrammarBoard } from './components/GrammarBoard';

/**
 * Grammar drill.
 * - PRACTICE: the current block's required article session — the block's new
 *   nouns, padded with recently-learned nouns when the block has fewer than 3.
 *   Completing it marks the block's Practice done, which gates advancement.
 * - RECAP: free review across every learned noun (does not gate).
 */
export function Grammar({ onExit, onOpenSettings, onMain, scope = 'practice' }: GameProps) {
  const { state, recordGrammarNoun, recordPracticeBlock } = usePlayer();
  const block = currentBlock(state, SETS);

  const items: GrammarContentItem[] = useMemo(() => {
    if (scope === 'recap') return shuffle(GRAMMAR_ITEMS.filter((i) => isItemEligible(i, state)));
    const byNoun = new Map(GRAMMAR_ITEMS.map((g) => [g.requires[0], g]));
    return practiceNounsForBlock(state, SETS, block)
      .map((id) => byNoun.get(id))
      .filter((g): g is GrammarContentItem => !!g);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, state.practiceBlocksDone, scope, block]);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope !== 'recap'}
      onWin={scope === 'recap' ? undefined : (item) => recordGrammarNoun(grammarNounId(item))}
      onComplete={scope === 'recap' ? undefined : () => recordPracticeBlock(block)}
      renderWin={(item) => (
        <div className="mt-3 w-full max-w-xs rounded-xl border border-line bg-sand/40 px-4 py-3 text-center">
          <p className="font-serif text-lg font-semibold text-espresso">{`${item.before}${item.stem}${item.ending}${item.after}`}</p>
          <p className="mt-1 text-sm text-taupe">{item.translation}</p>
        </div>
      )}
      renderBoard={(item, controls) => <GrammarBoard item={item} controls={controls} />}
    />
  );
}
