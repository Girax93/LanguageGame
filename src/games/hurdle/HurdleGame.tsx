import { useMemo, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { HURDLE_ITEMS, hurdleItemsForBlock, type HurdleContentItem } from '../../content/hurdleItems';
import { isItemEligible, currentBlock, hurdleRoundCount, isBlockComplete, focusWordIds } from '../../state/progression';
import { SETS, wordById, germanWithArticle } from '../../content/vocab';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { RevealCard } from '../_shared/CompleteScreen';
import { HurdleBoard } from './components/HurdleBoard';
import { triesFor } from './hurdle';

/**
 * Hurdle — a Wordle-style speller for ONE word at a time. The clue is the
 * word's English meaning; the player spells the word, with ~length+3 tries
 * (floor 5) instead of hearts.
 * - PRACTICE: the current block's words. Solving them is the fourth half of the
 *   block's Practice gate. Gates advancement.
 * - RECAP: free spelling across everything learned (does not gate).
 */
export function Hurdle({ onExit, onOpenSettings, onMain, onLearn, onRecap, onPractice, scope = 'practice' }: GameProps) {
  const { state, recordHurdleRound, addFocusMisses, recordFocusOutcome } = usePlayer();
  // Frozen at mount so the completion screen labels the block just practiced.
  const [block] = useState(() => currentBlock(state, SETS));

  const items: HurdleContentItem[] = useMemo(() => {
    if (scope === 'recap') return shuffle(HURDLE_ITEMS.filter((i) => isItemEligible(i, state)));
    if (scope === 'focus') {
      const focus = new Set(focusWordIds(state));
      return shuffle(HURDLE_ITEMS.filter((i) => isItemEligible(i, state) && focus.has(i.wordId)));
    }
    return hurdleItemsForBlock(block)
      .filter((i) => isItemEligible(i, state))
      .slice(hurdleRoundCount(state, block));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, state.focusPool, scope, block]);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope === 'practice'}
      livesForItem={(it) => triesFor(it.answer)}
      renderHud={(remaining, total) => <TriesLeft remaining={remaining} total={total} />}
      loseTitle="Out of tries"
      renderLoseExtra={(it) => <WordReveal item={it} />}
      onWin={
        scope === 'practice'
          ? () => recordHurdleRound(block)
          : scope === 'focus'
            ? (it) => recordFocusOutcome([it.wordId], [])
            : undefined
      }
      onLose={
        scope === 'practice'
          ? (it) => addFocusMisses([it.wordId])
          : scope === 'focus'
            ? (it) => recordFocusOutcome([], [it.wordId])
            : undefined
      }
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
                    title: 'Hurdle done!',
                    body: 'Keep going — finish this block’s other practice to unlock the next words.',
                    primaryLabel: 'Back to Practice',
                    onPrimary: onPractice ?? onExit,
                  }
          : undefined
      }
      renderWin={(it) => <WinCard item={it} />}
      renderBoard={(it, controls) => <HurdleBoard item={it} controls={controls} />}
    />
  );
}

function TriesLeft({ remaining, total }: { remaining: number; total: number }) {
  return (
    <span className="text-sm font-medium tabular-nums text-taupe" aria-label={`${remaining} of ${total} tries left`}>
      {remaining} {remaining === 1 ? 'try' : 'tries'} left
    </span>
  );
}

function WinCard({ item }: { item: HurdleContentItem }) {
  const w = wordById(item.wordId);
  return <RevealCard primary={w ? germanWithArticle(w) : item.answer} secondary={item.en} />;
}

function WordReveal({ item }: { item: HurdleContentItem }) {
  const w = wordById(item.wordId);
  return (
    <div className="mt-6 w-full max-w-xs rounded-xl border border-line bg-sand/40 px-4 py-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-taupe">The word was</p>
      <p className="mt-1 font-serif text-xl font-semibold text-espresso">{w ? germanWithArticle(w) : item.answer}</p>
      <p className="mt-1 text-sm text-taupe">{item.en}</p>
    </div>
  );
}
