import { useMemo, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { GRAMMAR_ITEMS, type GrammarContentItem } from '../../content/grammarItems';
import { isItemEligible, currentBlock, practiceNounsForBlock, practiceCount, isBlockComplete } from '../../state/progression';
import { SETS } from '../../content/vocab';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { GrammarBoard } from './components/GrammarBoard';
import { Button } from '../../components/ui/Button';
import { ChevronLeft } from '../../components/ui/icons';

/**
 * Grammar drill.
 * - PRACTICE: the current block's required article session (remaining drills of
 *   PROGRESSION.practiceRounds; pads with recent nouns when sparse). Gates.
 * - DAILY: a short bounded review (for the forced daily recap). Marks the recap
 *   done on completion; does not gate the block.
 * - RECAP: free review across every learned noun (does not gate).
 */
export function Grammar({ onExit, onOpenSettings, onMain, onLearn, onRecap, onPractice, onRecapDone, scope = 'practice' }: GameProps) {
  const { state, recordPracticeDrill } = usePlayer();
  // Frozen at mount so the completion screen labels the block just practiced
  // (currentBlock advances the instant the block completes).
  const [block] = useState(() => currentBlock(state, SETS));

  const items: GrammarContentItem[] = useMemo(() => {
    const eligible = GRAMMAR_ITEMS.filter((i) => isItemEligible(i, state));
    if (scope === 'recap') return shuffle(eligible);
    if (scope === 'daily') return shuffle(eligible).slice(0, 5);
    const byNoun = new Map(GRAMMAR_ITEMS.map((g) => [g.requires[0], g]));
    // The block's distinct learned nouns, minus those already drilled this
    // session. No wrap-around → a single-noun block shows ONE drill, not three.
    const pool = practiceNounsForBlock(state, SETS, block);
    const ids = pool.slice(practiceCount(state, block));
    return ids.map((id) => byNoun.get(id)).filter((g): g is GrammarContentItem => !!g);
    // Session is fixed when the screen opens; each drill updates the count, not the items.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.learnedWords, scope, block]);

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope === 'practice'}
      onWin={scope === 'practice' ? () => recordPracticeDrill(block) : undefined}
      renderComplete={
        scope === 'practice'
          ? () => <PracticeDone block={block} onExit={onExit} onLearn={onLearn} onRecap={onRecap} onPractice={onPractice} />
          : scope === 'daily'
            ? () => <DailyDone onContinue={onRecapDone ?? onExit} />
            : undefined
      }
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

/** Shown when the grammar drills are finished. Only the LAST remaining practice
 *  completes the block; until then we send the player back to Practice (this
 *  stays correct as more Practice games are added). */
function PracticeDone({
  block,
  onExit,
  onLearn,
  onRecap,
  onPractice,
}: {
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
      title="Grammar done!"
      body="Keep going — finish this block’s other practice to unlock the next words."
      primaryLabel="Back to Practice"
      onPrimary={onPractice ?? onExit}
    />
  );
}

/** Shown when the daily recap session is finished. */
function DailyDone({ onContinue }: { onContinue: () => void }) {
  return (
    <Done
      onExit={onContinue}
      title="Daily recap done!"
      body="Nice — your words are fresh. See you tomorrow."
      primaryLabel="Continue"
      onPrimary={onContinue}
    />
  );
}

function Done({
  onExit,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  onExit: () => void;
  title: string;
  body: string;
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
