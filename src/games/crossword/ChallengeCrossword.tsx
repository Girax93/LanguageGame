import { useMemo } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { SETS } from '../../content/vocab';
import { pendingChallenge } from '../../state/progression';
import { challengeCrossword } from '../../content/challenges';
import type { CrosswordContentItem } from '../../content/crosswords';
import { LevelStage } from '../_shared/LevelStage';
import { CrosswordBoard } from './components/CrosswordBoard';

/**
 * The required "level challenge": after every 4 sets, one crossword that uses
 * every word the player learned in those sets (3 lives, gates the next block).
 * The puzzle is generated deterministically per block, so retries are the same.
 */
export function ChallengeCrossword({ onExit, onOpenSettings, onMain }: GameProps) {
  const { state, recordChallenge } = usePlayer();
  const block = pendingChallenge(state, SETS);
  const items: CrosswordContentItem[] = useMemo(
    () => (block === null ? [] : [challengeCrossword(block)]),
    [block],
  );

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={false}
      onWin={block === null ? undefined : () => recordChallenge(block)}
      renderBoard={(item, controls) => <CrosswordBoard item={item} controls={controls} />}
    />
  );
}
