import { useMemo, useState, type ReactNode } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { HURDLE_ITEMS, hurdleItemsForBlock, type HurdleContentItem } from '../../content/hurdleItems';
import { isItemEligible, currentBlock, hurdleRoundCount, isBlockComplete } from '../../state/progression';
import { SETS, wordById, germanWithArticle } from '../../content/vocab';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { HurdleBoard } from './components/HurdleBoard';
import { triesFor } from './hurdle';
import { Button } from '../../components/ui/Button';
import { ChevronLeft } from '../../components/ui/icons';

/**
 * Hurdle — a Wordle-style speller for ONE word at a time. The clue is the
 * word's English meaning; the player spells the German word, with ~length+3
 * tries (floor 5) instead of hearts.
 * - PRACTICE: the current block's words (its "batch"). Solving them is the
 *   fourth half of the block's Practice gate. Gates advancement.
 * - RECAP: free spelling across everything learned (does not gate).
 */
export function Hurdle({ onExit, onOpenSettings, onMain, onLearn, onRecap, onPractice, scope = 'practice' }: GameProps) {
  const { state, recordHurdleRound } = usePlayer();
  // Frozen at mount so the completion screen labels the block just practiced
  // (currentBlock advances the instant the block completes).
  const [block] = useState(() => currentBlock(state, SETS));

  const items: HurdleContentItem[] = useMemo(() => {
    if (scope === 'recap') return shuffle(HURDLE_ITEMS.filter((i) => isItemEligible(i, state)));
    // Resume the block's session from the first not-yet-solved word.
    return hurdleItemsForBlock(block)
      .filter((i) => isItemEligible(i, state))
      .slice(hurdleRoundCount(state, block));
    // Session is fixed when the screen opens; each solve updates the count, not the items.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, scope, block]);

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
      onWin={scope === 'practice' ? () => recordHurdleRound(block) : undefined}
      renderComplete={
        scope === 'practice'
          ? (item) => <HurdleDone item={item} block={block} onExit={onExit} onLearn={onLearn} onRecap={onRecap} onPractice={onPractice} />
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
  return (
    <div className="mt-3 w-full max-w-xs rounded-xl border border-line bg-sand/40 px-4 py-3 text-center">
      <p className="font-serif text-lg font-semibold text-espresso">{w ? germanWithArticle(w) : item.answer}</p>
      <p className="mt-1 text-sm text-taupe">{item.en}</p>
    </div>
  );
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

/** Shown when the block's Hurdle session is finished. Only the LAST remaining
 *  practice completes the block; until then we send the player back to Practice.
 *  Either way we reveal the word just solved (it was hidden during play). */
function HurdleDone({
  item,
  block,
  onExit,
  onLearn,
  onRecap,
  onPractice,
}: {
  item: HurdleContentItem;
  block: number;
  onExit: () => void;
  onLearn?: () => void;
  onRecap?: () => void;
  onPractice?: () => void;
}) {
  const { state } = usePlayer();
  if (isBlockComplete(state, SETS, block)) {
    return (
      <Done
        onExit={onExit}
        title="Block complete!"
        body="Every practice for this block is done — the next words are unlocked."
        reveal={<WinCard item={item} />}
        primaryLabel="Learn more words"
        onPrimary={onLearn ?? onExit}
        secondaryLabel="Recap what you’ve learned"
        onSecondary={onRecap ?? onExit}
      />
    );
  }
  return (
    <Done
      onExit={onExit}
      title="Hurdle done!"
      body="Keep going — finish this block’s other practice to unlock the next words."
      reveal={<WinCard item={item} />}
      primaryLabel="Back to Practice"
      onPrimary={onPractice ?? onExit}
    />
  );
}

function Done({
  onExit,
  title,
  body,
  reveal,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  onExit: () => void;
  title: string;
  body: string;
  reveal?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center">
        <button
          onClick={onExit}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
        >
          <ChevronLeft />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
        <div className="text-4xl text-brown">✓</div>
        <h2 className="mt-5 font-serif text-2xl font-semibold text-espresso">{title}</h2>
        <p className="mt-2 max-w-xs text-taupe">{body}</p>
        {reveal}
        <Button className="mt-8 w-64" onClick={onPrimary}>
          {primaryLabel}
        </Button>
        {secondaryLabel && onSecondary && (
          <button
            onClick={onSecondary}
            className="mt-4 text-sm font-medium text-brown transition hover:text-espresso"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
