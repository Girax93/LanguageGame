import { useEffect, useState, type ReactNode } from 'react';
import type { Route } from './routes';
import { getGame } from '../games/registry';
import { ChallengeCrossword } from '../games/crossword/ChallengeCrossword';
import { LevelStage } from '../games/_shared/LevelStage';
import { CrosswordBoard } from '../games/crossword/components/CrosswordBoard';
import { challengeCrossword } from '../content/challenges';
import { MenuScreen, type MenuItem } from '../components/ui/MenuScreen';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Statistics } from './Statistics';
import { Store } from './Store';
import { Settings } from './Settings';
import { Account } from './Account';
import { Subscription } from './Subscription';
import { ResetProgress } from './ResetProgress';
import { usePlayer } from '../state/PlayerContext';
import { SETS } from '../content/vocab';
import { PROGRESSION } from '../state/progressionConfig';
import {
  currentLearnSetIndex,
  masteredSetCount,
  currentBlock,
  blockCount,
  blockPracticeDone,
  practiceCount,
  cipherRoundCount,
  cipherSessionDone,
  crosswordRoundCount,
  crosswordSessionDone,
  recapDue,
} from '../state/progression';
import { cipherRoundsForBlock } from '../content/cipherItems';
import { crosswordRoundsForBlock } from '../content/crosswords';

export function App() {
  const { state, now, recordRecapDone, forceRecapDue } = usePlayer();
  const [stack, setStack] = useState<Route[]>(['main']);
  const [confirmMain, setConfirmMain] = useState(false);
  const [recapBlock, setRecapBlock] = useState<number | null>(null);
  const route = stack[stack.length - 1];

  useEffect(() => {
    window.history.replaceState({ stack: ['main'] }, '');
    function onPop(e: PopStateEvent) {
      const s = (e.state && (e.state as { stack?: Route[] }).stack) || ['main'];
      setStack(s);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function navigate(r: Route) {
    const next = [...stack, r];
    window.history.pushState({ stack: next }, '');
    setStack(next);
  }
  function back() {
    if (stack.length > 1) window.history.back();
  }
  function goMain() {
    setConfirmMain(false);
    if (stack.length > 1) window.history.go(-(stack.length - 1));
  }
  const requestMain = () => setConfirmMain(true);

  const blocks = blockCount(SETS);
  const block = currentBlock(state, SETS);
  const onBlock = block < blocks;
  const recapDueNow = recapDue(state, SETS, now);
  const curIdx = currentLearnSetIndex(state, SETS);

  const masteredSets = masteredSetCount(state, SETS);
  // Practice always refers to the latest FULLY-learned block, so finishing a
  // block shows "Completed" here — not the next (unlearned) block's empty 0/X.
  const practiceIdx = Math.floor(masteredSets / PROGRESSION.setsPerBlock) - 1;
  const hasPractice = practiceIdx >= 0;
  const pTarget = PROGRESSION.practiceRounds;
  const pgCount = hasPractice ? practiceCount(state, practiceIdx) : 0;
  const pcCount = hasPractice ? cipherRoundCount(state, practiceIdx) : 0;
  const pcTarget = hasPractice ? cipherRoundsForBlock(practiceIdx) : 0;
  const pxCount = hasPractice ? crosswordRoundCount(state, practiceIdx) : 0;
  const pxTarget = hasPractice ? crosswordRoundsForBlock(practiceIdx) : 0;
  const pGrammarDone = hasPractice ? blockPracticeDone(state, practiceIdx) : false;
  const pCipherDone = hasPractice ? cipherSessionDone(state, practiceIdx) : false;
  const pCrosswordDone = hasPractice ? crosswordSessionDone(state, practiceIdx) : false;
  const practiceComplete = hasPractice && pGrammarDone && pCipherDone && pCrosswordDone;
  // Combined "X/total" across all three Practice games.
  const pDoneCount = pgCount + pcCount + pxCount;
  const pTotalTarget = pTarget + pcTarget + pxTarget;
  const mustPractice = curIdx === null && onBlock && !practiceComplete;

  let learnStatus: string;
  let learnProgress: number;
  if (curIdx !== null) {
    const set = SETS[curIdx];
    const masteredN = set.words.filter((w) => state.learnedWords.includes(w.id)).length;
    learnStatus = 'Available';
    learnProgress = set.words.length ? masteredN / set.words.length : 1;
  } else if (mustPractice) {
    learnStatus = 'Practice to advance';
    learnProgress = 1;
  } else {
    learnStatus = 'All learned';
    learnProgress = 1;
  }

  const practiceUnlocked = masteredSets >= 1;
  const recapUnlocked = masteredSets >= 2;
  const completedChallenges = [...(state.challengesDone ?? [])].sort((a, b) => a - b);

  const mainItems: MenuItem[] = [
    { icon: '📖', label: 'Learn', sublabel: 'Acquire words in a language', onClick: () => navigate('languages') },
    { icon: '📈', label: 'Statistics', sublabel: 'Words learned and level progress', onClick: () => navigate('statistics') },
    { icon: '🛒', label: 'Store', sublabel: 'Premium and extras', onClick: () => navigate('store') },
    { icon: '⚙️', label: 'Settings', sublabel: 'Account, subscription, reset', onClick: () => navigate('settings') },
  ];
  const languageItems: MenuItem[] = [
    { icon: '🇩🇪', label: 'German', sublabel: 'Beginner · A1', onClick: () => navigate('lang-menu') },
    { icon: '🇳🇴', label: 'Norwegian', sublabel: 'Bokmål', badge: 'Coming', locked: true },
  ];

  // When the daily recap is due, it's the only way forward — Learn/Practice/Recap lock.
  const langMenuItems: MenuItem[] = recapDueNow
    ? [
        {
          icon: '☀️',
          label: 'Daily Recap',
          sublabel: 'Keep your words fresh to keep going',
          badge: 'Required',
          onClick: () => navigate('daily-recap-grammar'),
        },
        { icon: '📖', label: 'Learn', sublabel: 'Finish your daily recap first', badge: 'Locked', locked: true },
        { icon: '🎯', label: 'Practice', sublabel: 'Finish your daily recap first', badge: 'Locked', locked: true },
        { icon: '🔁', label: 'Recap', sublabel: 'Finish your daily recap first', badge: 'Locked', locked: true },
      ]
    : [
        {
          icon: '📖',
          label: 'Learn',
          sublabel: mustPractice ? 'Finish Practice to unlock the next words' : 'Pick up the next words',
          status: learnStatus,
          progress: learnProgress,
          locked: mustPractice,
          onClick: mustPractice ? () => navigate('practice') : () => navigate('learn'),
        },
        {
          icon: '🎯',
          label: 'Practice',
          sublabel: practiceUnlocked ? 'Drill the new words to advance' : 'Learn a set to unlock practice',
          status: !practiceUnlocked || !hasPractice ? undefined : practiceComplete ? '✓' : `${pDoneCount}/${pTotalTarget}`,
          progress: practiceComplete ? 1 : !hasPractice ? 0 : pTotalTarget ? pDoneCount / pTotalTarget : 0,
          badge: !practiceUnlocked ? 'Locked' : mustPractice ? 'Required' : undefined,
          locked: !practiceUnlocked,
          onClick: practiceUnlocked ? () => navigate('practice') : undefined,
        },
        {
          icon: '🔁',
          label: 'Recap',
          sublabel: recapUnlocked
            ? 'Mixed review of everything you know'
            : `Master 2 sets to unlock · ${masteredSets}/2`,
          status: recapUnlocked ? `${state.learnedWords.length} words` : undefined,
          badge: recapUnlocked ? undefined : 'Locked',
          locked: !recapUnlocked,
          onClick: recapUnlocked ? () => navigate('recap') : undefined,
        },
        // DEV/TESTING: trigger the daily recap without waiting 24h.
        { icon: '🔧', label: 'Dev: trigger daily recap', sublabel: 'Testing only', onClick: () => forceRecapDue() },
      ];

  const practiceItems: MenuItem[] = [
    {
      icon: '🔡',
      label: 'Letter Cipher',
      sublabel: 'Decode sentences built from this block’s new words',
      status: !hasPractice ? undefined : pCipherDone ? (practiceComplete ? 'Completed' : 'Done ✓') : `${pcCount}/${pcTarget}`,
      progress: !hasPractice ? 0 : pCipherDone ? 1 : pcTarget ? pcCount / pcTarget : 1,
      locked: !hasPractice || pCipherDone,
      onClick: hasPractice && !pCipherDone ? () => navigate('fill-in-the-blanks') : undefined,
    },
    {
      icon: '🧠',
      label: 'Grammar',
      sublabel: 'A few der / die / das drills to clear this block',
      status: !hasPractice ? undefined : pGrammarDone ? (practiceComplete ? 'Completed' : 'Done ✓') : `${pgCount}/${pTarget}`,
      progress: !hasPractice ? 0 : pGrammarDone ? 1 : pgCount / pTarget,
      locked: !hasPractice || pGrammarDone,
      onClick: hasPractice && !pGrammarDone ? () => navigate('grammar') : undefined,
    },
    {
      icon: '🧩',
      label: 'Crossword',
      sublabel: 'Fit this block’s leftover words into a grid',
      status: !hasPractice || !pxTarget ? undefined : pCrosswordDone ? (practiceComplete ? 'Completed' : 'Done ✓') : `${pxCount}/${pxTarget}`,
      progress: !hasPractice ? 0 : pCrosswordDone ? 1 : pxTarget ? pxCount / pxTarget : 1,
      locked: !hasPractice || pCrosswordDone,
      onClick: hasPractice && !pCrosswordDone ? () => navigate('crossword') : undefined,
    },
  ];

  // Shown on the Practice screen once the lesson's cipher + grammar are both done.
  const practiceFooter = practiceComplete ? (
    <div className="mt-6 rounded-2xl border border-line bg-sand/40 p-5 text-center animate-fade-in">
      <div className="text-3xl text-brown" aria-hidden>✓</div>
      <h3 className="mt-2 font-serif text-lg font-semibold text-espresso">Great job!</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-taupe">
        Your practice for this lesson is done. Click{' '}
        <button type="button" onClick={() => navigate('recap')} className="font-medium text-brown underline underline-offset-2 transition hover:text-espresso">here</button>{' '}
        to keep rehearsing everything you’ve learned, or{' '}
        <button type="button" onClick={() => navigate('learn')} className="font-medium text-brown underline underline-offset-2 transition hover:text-espresso">here</button>{' '}
        to learn new words!
      </p>
    </div>
  ) : undefined;

  const recapItems: MenuItem[] = [
    { icon: '🔡', label: 'Letter Cipher', sublabel: 'Decode sentences from everything you know', onClick: () => navigate('recap-cipher') },
    { icon: '🧠', label: 'Grammar', sublabel: 'Articles across everything you know', onClick: () => navigate('recap-grammar') },
    ...completedChallenges.map((b) => ({
      icon: '🏆',
      label: `Challenge — sets ${b * 2 + 1}–${b * 2 + 2}`,
      sublabel: 'Replay this block’s crossword',
      onClick: () => {
        setRecapBlock(b);
        navigate('recap-challenge');
      },
    })),
  ];

  let screen: ReactNode;
  switch (route) {
    case 'languages':
      screen = <MenuScreen title="Learn" items={languageItems} onBack={back} onMain={requestMain} />;
      break;
    case 'lang-menu':
      screen = <MenuScreen title="German" items={langMenuItems} onBack={back} onMain={requestMain} />;
      break;
    case 'practice':
      screen = (
        <MenuScreen
          title="Practice"
          intro={
            !hasPractice
              ? 'Finish learning this block to unlock its practice.'
              : practiceComplete
                ? undefined
                : 'Clear this block’s Letter Cipher, Grammar and Crossword to unlock the next words.'
          }
          items={practiceItems}
          footer={practiceFooter}
          onBack={back}
          onMain={requestMain}
        />
      );
      break;
    case 'recap':
      screen = (
        <MenuScreen
          title="Recap"
          intro="Mixed review from everything you've learned. Optional — it won't change your unlock progress."
          items={recapItems}
          onBack={back}
          onMain={requestMain}
        />
      );
      break;
    case 'statistics':
      screen = <Statistics onBack={back} onMain={requestMain} />;
      break;
    case 'store':
      screen = <Store onBack={back} onMain={requestMain} />;
      break;
    case 'settings':
      screen = <Settings onBack={back} onMain={requestMain} onOpen={navigate} />;
      break;
    case 'account':
      screen = <Account onBack={back} onMain={requestMain} />;
      break;
    case 'subscription':
      screen = <Subscription onBack={back} onMain={requestMain} />;
      break;
    case 'reset':
      screen = <ResetProgress onBack={back} onMain={requestMain} />;
      break;
    case 'learn':
    case 'fill-in-the-blanks':
    case 'grammar':
    case 'crossword': {
      const Game = getGame(route)?.component;
      screen = Game ? (
        <Game
          onExit={back}
          onOpenSettings={() => navigate('settings')}
          onMain={requestMain}
          onPractice={() => navigate('practice')}
          onLearn={() => navigate('learn')}
          onRecap={() => navigate('recap')}
        />
      ) : null;
      break;
    }
    case 'recap-cipher': {
      const Game = getGame('fill-in-the-blanks')?.component;
      screen = Game ? (
        <Game onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} scope="recap" />
      ) : null;
      break;
    }
    case 'recap-grammar': {
      const Game = getGame('grammar')?.component;
      screen = Game ? (
        <Game onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} scope="recap" />
      ) : null;
      break;
    }
    case 'daily-recap-grammar': {
      const Game = getGame('grammar')?.component;
      screen = Game ? (
        <Game
          onExit={back}
          onOpenSettings={() => navigate('settings')}
          onMain={requestMain}
          scope="daily"
          onRecapDone={() => {
            recordRecapDone();
            back();
          }}
        />
      ) : null;
      break;
    }
    case 'recap-challenge':
      screen =
        recapBlock !== null ? (
          <LevelStage
            items={[challengeCrossword(recapBlock)]}
            onExit={back}
            onOpenSettings={() => navigate('settings')}
            onMain={requestMain}
            countsTowardGate={false}
            renderBoard={(item, controls) => <CrosswordBoard item={item} controls={controls} />}
          />
        ) : null;
      break;
    case 'challenge':
      screen = (
        <ChallengeCrossword onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} />
      );
      break;
    default:
      screen = <MenuScreen items={mainItems} />;
  }

  const pinned =
    route === 'fill-in-the-blanks' ||
    route === 'grammar' ||
    route === 'crossword' ||
    route === 'recap-cipher' ||
    route === 'recap-grammar' ||
    route === 'daily-recap-grammar' ||
    route === 'recap-challenge' ||
    route === 'challenge';

  return (
    <div className="h-full bg-page text-espresso">
      <div
        className={`mx-auto flex h-full w-full max-w-screen-sm flex-col px-5 pt-6 ${
          pinned ? 'overflow-hidden pb-4' : 'overflow-y-auto pb-10'
        }`}
      >
        {screen}
      </div>
      {confirmMain && (
        <ConfirmDialog
          title="Go to the main menu?"
          body="Your progress is saved automatically."
          confirmLabel="Save & go to menu"
          cancelLabel="Stay here"
          onConfirm={goMain}
          onCancel={() => setConfirmMain(false)}
        />
      )}
    </div>
  );
}
