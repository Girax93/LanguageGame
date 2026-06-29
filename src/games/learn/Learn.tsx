import { useEffect, useMemo, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { SETS, wordById } from '../../content/vocab';
import { wordsToStudy, currentLearnSetIndex } from '../../state/progression';
import { shuffle } from '../../lib/array';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkipButton } from '../_shared/LevelStage';
import { ChevronLeft, HomeIcon, FlameIcon } from '../../components/ui/icons';
import { makeExerciseStep, type Step } from './engine';
import { IntroCard, Choice, TypeIn, Scramble, Gender, Pairs } from './components';

const PAIRS_EVERY = 5; // insert a matching round roughly every N exercises

export function Learn({ onExit, onMain, onPractice, studyIds }: GameProps & { studyIds?: string[] }) {
  const { state, answerWord } = usePlayer();
  // `studyIds` (focus pool "learn again") overrides the normal next-set study list
  // with an explicit word list — a refresher over already-learned words.
  const study = studyIds ?? wordsToStudy(state, SETS);
  const setIdx = studyIds ? null : currentLearnSetIndex(state, SETS);
  const currentSet = setIdx !== null ? SETS[setIdx] : null;
  const knownIds = useMemo(() => new Set(state.learnedWords), [state.learnedWords]);

  const [introduced, setIntroduced] = useState<Set<string>>(() => new Set());
  const [step, setStep] = useState<Step | null>(() =>
    study.length ? { kind: 'intro', word: wordById(study[0])! } : null,
  );
  const [combo, setCombo] = useState(0);
  const [exCount, setExCount] = useState(0);

  // Choose the next thing to show: an occasional pairs interlude, otherwise the
  // next un-introduced word's intro, otherwise an exercise on a seen word.
  function buildNext(): Step | null {
    if (study.length === 0) return null;
    const seenInSet = currentSet ? currentSet.words.filter((w) => introduced.has(w.id)) : [];
    if (exCount > 0 && exCount % PAIRS_EVERY === 0 && seenInSet.length >= 4) {
      return { kind: 'pairs', words: shuffle(seenInSet).slice(0, 4) };
    }
    const fresh = study.find((id) => !introduced.has(id));
    if (fresh) return { kind: 'intro', word: wordById(fresh)! };
    const seenStudy = study.filter((id) => introduced.has(id));
    const targetId = seenStudy[Math.floor(Math.random() * seenStudy.length)] ?? study[0];
    return makeExerciseStep(wordById(targetId)!, state.wordProgress[targetId] ?? 0);
  }

  // Build the next step once the current one is cleared and words remain.
  useEffect(() => {
    if (step === null && study.length > 0) setStep(buildNext());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, study.length, exCount]);

  function afterAnswer(wordId: string, correct: boolean) {
    answerWord(wordId, correct);
    setCombo((c) => (correct ? c + 1 : 0));
    setExCount((c) => c + 1);
    setStep(null);
  }
  function introNext(wordId: string) {
    setIntroduced((s) => new Set(s).add(wordId));
    setStep(makeExerciseStep(wordById(wordId)!, state.wordProgress[wordId] ?? 0));
  }
  function pairsDone() {
    setExCount((c) => c + 1);
    setStep(null);
  }
  // DEV/TESTING: master the current word (if any) and jump on.
  function skip() {
    if (!step) return;
    if ('word' in step) {
      answerWord(step.word.id, true);
      answerWord(step.word.id, true);
    }
    setStep(null);
  }

  const setSize = currentSet ? currentSet.words.length : 0;
  const masteredInSet = currentSet
    ? currentSet.words.filter((w) => state.learnedWords.includes(w.id)).length
    : setSize;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
        >
          <ChevronLeft />
        </button>
        <h2 className="eyebrow">{studyIds ? 'Review' : currentSet ? `Learn · Set ${currentSet.index + 1}` : 'Learn'}</h2>
        <div className="flex items-center gap-1.5">
          {combo >= 2 && (
            <span className="flex items-center gap-0.5 rounded-full bg-sand px-2 py-0.5 text-xs font-semibold tabular-nums text-ochre animate-pop-in">
              <FlameIcon size={13} />
              {combo}
            </span>
          )}
          {step !== null && <SkipButton onSkip={skip} />}
          <span className="text-xs tabular-nums text-taupe">
            {masteredInSet}/{setSize}
          </span>
          {onMain && (
            <button
              onClick={onMain}
              aria-label="Main menu"
              className="rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
            >
              <HomeIcon />
            </button>
          )}
        </div>
      </div>
      <ProgressBar value={setSize === 0 ? 1 : masteredInSet / setSize} />

      {step === null ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
          <div className="text-4xl text-brown">✦</div>
          <h3 className="mt-5 font-serif text-2xl font-semibold text-espresso">Set complete!</h3>
          {currentSet && <p className="mt-1 font-serif text-lg text-brown">{setSize} words learned</p>}
          <p className="mt-2 max-w-xs text-taupe">
            Practise them to unlock the next set.
          </p>
          <Button className="mt-8" onClick={onPractice ?? onExit}>
            Practice now!
          </Button>
        </div>
      ) : step.kind === 'intro' ? (
        <IntroCard word={step.word} knownIds={knownIds} onNext={() => introNext(step.word.id)} />
      ) : step.kind === 'choice' ? (
        <Choice step={step} onResult={(c) => afterAnswer(step.word.id, c)} />
      ) : step.kind === 'type' ? (
        <TypeIn step={step} onResult={(c) => afterAnswer(step.word.id, c)} />
      ) : step.kind === 'scramble' ? (
        <Scramble step={step} onResult={(c) => afterAnswer(step.word.id, c)} />
      ) : step.kind === 'gender' ? (
        <Gender step={step} onResult={(c) => afterAnswer(step.word.id, c)} />
      ) : (
        <Pairs words={step.words} onMatch={(id) => answerWord(id, true)} onDone={pairsDone} />
      )}
    </div>
  );
}
