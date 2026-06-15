import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { CROSSWORDS, type CrosswordContentItem } from '../../content/crosswords';
import { isItemEligible } from '../../state/progression';
import { shuffle } from '../../lib/array';
import { LevelStage } from '../_shared/LevelStage';
import { CrosswordBoard } from './components/CrosswordBoard';

export function Crossword({ onExit, onOpenSettings, onMain, scope = 'recap' }: GameProps) {
  const { state } = usePlayer();
  // Crosswords need several intersecting words, so they always draw from the
  // full mastered pool (strict gate: a puzzle needs ALL its answers learned).
  const items: CrosswordContentItem[] = shuffle(CROSSWORDS.filter((p) => isItemEligible(p, state)));

  return (
    <LevelStage
      items={items}
      onExit={onExit}
      onOpenSettings={onOpenSettings}
      onMain={onMain}
      countsTowardGate={scope !== 'recap'}
      renderBoard={(item, controls) => <CrosswordBoard item={item} controls={controls} />}
    />
  );
}
