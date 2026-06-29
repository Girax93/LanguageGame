import { useMemo, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { GRAMMAR_ITEMS, type GrammarContentItem } from '../../content/grammarItems';
import { isItemEligible, currentBlock, practiceNounsForBlock, practiceCount, isBlockComplete, focusWordIds } from '../../state/progression';
import { SETS } from '../../content/vocab';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { RevealCard } from '../_shared/CompleteScreen';
import { GrammarBoard } from './components/GrammarBoard';

/**
 * Grammar drill.
 * - PRACTICE: the current block's required article session. Gates.
 * - DAILY: a short bounded review (for the forced daily recap). Does not gate.
 * - RECAP: free review across every learned noun (does not gate).
 */
export function Grammar({ onExit, onOpenSettings, onMain, onLearn, onRecap, onPractice, onRecapDone, scope = 'practice' }: GameProps) {
  const { state, recordPracticeDrill, recordFocusOutcome } = usePlayer();
  // Frozen at mount so the completion screen labels the block just practiced.
  const [block] = useState(() => currentBlock(state, SETS));

  const items: GrammarContentItem[] = useMemo(() => {
    const eligible = GRAMMAR_ITEMS.filter((i) => isItemEligible(i, state));
    if (scope === 'recap') return shuffle(eligible);
    if (scope === 'daily') return shuffle(eligible).slice(0, 5);
    if (scope === 'focus') {
      const focus = new Set(focusWordIds(state));
      return shuffle(eligible.filter((g) => focus.has(g.requires[0])));
    }
    const byNoun = new Map(GRAMMAR_ITEMS.map((g) => [g.requires[0], g]));
    const pool = practiceNounsForBlock(state, SETS, block);
    const ids = pool.slice(practiceCount(state, block));
    return ids.map((id) => byNoun.get(id)).filter((g): g is GrammarContentItem => !!g);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, state.focusPool, scope, block]);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope === 'practice'}
      onWin={
        scope === 'practice'
          ? () => recordPracticeDrill(block)
          : scope === 'focus'
            ? (it) => recordFocusOutcome([it.requires[0]], [])
            : undefined
      }
      onLose={scope === 'focus' ? (it) => recordFocusOutcome([], [it.requires[0]]) : undefined}
      wordsForItem={(it) => it.requires}
      completeSpec={
        scope === 'practice'
          ? () =>
              isBlockComplete(state, SETS, block)
                ? {
                    title: 'Block complete!',
                    body: 'Every practice for this block is done — the next words are unlocked.',
                    primaryLabel: 'Learn more words',
                    onPrimary: onLearn ?? onExit,
                    secondaryLabel: 'Recap what you’ve learned',
                    onSecondary: onRecap ?? onExit,
                  }
                : {
                    title: 'Grammar done!',
                    body: 'Keep going — finish this block’s other practice to unlock the next words.',
                    primaryLabel: 'Back to Practice',
                    onPrimary: onPractice ?? onExit,
                  }
          : scope === 'daily'
            ? () => ({
                title: 'Daily recap done!',
                body: 'Nice — your words are fresh. See you tomorrow.',
                primaryLabel: 'Continue',
                onPrimary: onRecapDone ?? onExit,
              })
            : undefined
      }
      renderWin={(item) => <WinCard item={item} />}
      renderBoard={(item, controls) => <GrammarBoard item={item} controls={controls} />}
    />
  );
}

function WinCard({ item }: { item: GrammarContentItem }) {
  return <RevealCard primary={`${item.before}${item.stem}${item.ending}${item.after}`} secondary={item.translation} />;
}
