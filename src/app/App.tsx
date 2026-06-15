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
import {
  currentLearnSetIndex,
  masteredSetCount,
  currentBlock,
  blockCount,
  cipherProgress,
  grammarProgress,
  challengeReady,
  isChallengeDone,
} from '../state/progression';

/**
 * App shell + screen router with a real navigation stack wired to browser
 * history, so the device/back gesture steps back one screen instead of
 * quitting. A "Main menu" button (with a confirm) jumps home from anywhere.
 */
export function App() {
  const { state } = usePlayer();
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

  // ── Block-coverage progress ────────────────────────────────────────────────
  const blocks = blockCount(SETS);
  const block = currentBlock(state, SETS); // the block being worked on (or `blocks`)
  const onBlock = block < blocks;
  const cp = onBlock ? cipherProgress(state, SETS, block) : { done: 0, total: 0 };
  const gp = onBlock ? grammarProgress(state, SETS, block) : { done: 0, total: 0 };
  const challengeReadyNow = onBlock && challengeReady(state, SETS, block);
  const challengeDoneForBlock = onBlock && isChallengeDone(state, block);

  const curIdx = currentLearnSetIndex(state, SETS);
  let learnStatus: string;
  let learnProgress: number;
  if (curIdx !== null) {
    const set = SETS[curIdx];
    const masteredN = set.words.filter((w) => state.learnedWords.includes(w.id)).length;
    learnStatus = 'Available';
    learnProgress = set.words.length ? masteredN / set.words.length : 1;
  } else if (onBlock) {
    learnStatus = 'Practice to advance';
    learnProgress = 1;
  } else {
    learnStatus = 'All learned';
    learnProgress = 1;
  }

  // Overall block progress = ciphers + grammar + the one challenge.
  const totalSteps = onBlock ? cp.total + gp.total + 1 : 0;
  const doneSteps = onBlock ? cp.done + gp.done + (challengeDoneForBlock ? 1 : 0) : 0;
  const practiceProgress = totalSteps ? doneSteps / totalSteps : 1;
  const practiceStatus = onBlock ? `${doneSteps}/${totalSteps}` : 'Done ✓';

  const masteredSets = masteredSetCount(state, SETS);
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
  const langMenuItems: MenuItem[] = [
    {
      icon: '📖',
      label: 'Learn',
      sublabel: 'Pick up the next words',
      status: learnStatus,
      progress: learnProgress,
      onClick: () => navigate('learn'),
    },
    {
      icon: '🎯',
      label: 'Practice',
      sublabel: 'Cover the new words to unlock the next set',
      status: practiceStatus,
      progress: practiceProgress,
      onClick: () => navigate('practice'),
    },
    {
      icon: '🔁',
      label: 'Recap',
      sublabel: recapUnlocked
        ? 'Mixed review of everything you know'
        : 'Learn 2 sets to unlock spaced review',
      status: recapUnlocked ? `${state.learnedWords.length} words` : undefined,
      badge: recapUnlocked ? undefined : 'Locked',
      locked: !recapUnlocked,
      onClick: recapUnlocked ? () => navigate('recap') : undefined,
    },
  ];

  const practiceItems: MenuItem[] = [
    {
      icon: '🔡',
      label: 'Letter Cipher',
      sublabel: 'Use every new word in a sentence',
      status: onBlock ? `${cp.done}/${cp.total}` : '✓',
      progress: onBlock && cp.total ? cp.done / cp.total : 1,
      onClick: () => navigate('fill-in-the-blanks'),
    },
    {
      icon: '🧠',
      label: 'Grammar',
      sublabel: 'Drill der / die / das for the new nouns',
      status: onBlock ? (gp.total ? `${gp.done}/${gp.total}` : 'none') : '✓',
      progress: onBlock && gp.total ? gp.done / gp.total : 1,
      onClick: () => navigate('grammar'),
    },
    {
      icon: '🏆',
      label: 'Challenge',
      sublabel: challengeReadyNow
        ? 'One crossword with all 10 new words'
        : challengeDoneForBlock || !onBlock
          ? 'Crossword complete'
          : 'Finish ciphers & grammar first',
      status: challengeReadyNow ? '3 lives' : challengeDoneForBlock || !onBlock ? '✓' : undefined,
      badge: challengeReadyNow ? 'Required' : undefined,
      locked: !challengeReadyNow,
      onClick: challengeReadyNow ? () => navigate('challenge') : undefined,
    },
  ];

  const recapItems: MenuItem[] = [
    { icon: '🧠', label: 'Grammar', sublabel: 'Articles across everything you know', onClick: () => navigate('recap-grammar') },
    { icon: '🔡', label: 'Letter Cipher', sublabel: 'Sentences from your whole vocabulary', onClick: () => navigate('recap-cipher') },
    { icon: '🧩', label: 'Crossword', sublabel: 'Interlocking grids from your vocabulary', onClick: () => navigate('recap-crossword') },
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
          intro="Use every new word in ciphers, drill the new articles, then beat the crossword to unlock the next set."
          items={practiceItems}
          onBack={back}
          onMain={requestMain}
        />
      );
      break;
    case 'recap':
      screen = (
        <MenuScreen
          title="Recap"
          intro="Mixed review from everything you've learned, plus your past challenges. Optional — it won't change your unlock progress."
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
    case 'grammar': {
      const Game = getGame(route)?.component;
      screen = Game ? (
        <Game onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} />
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
    case 'recap-crossword': {
      const Game = getGame('crossword')?.component;
      screen = Game ? (
        <Game onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} scope="recap" />
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
    route === 'recap-cipher' ||
    route === 'recap-grammar' ||
    route === 'recap-crossword' ||
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
