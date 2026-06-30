import { useEffect, useState, type ReactNode } from 'react';
import type { Route } from './routes';
import { getGame } from '../games/registry';
import { ChallengeCrossword } from '../games/crossword/ChallengeCrossword';
import { LevelStage } from '../games/_shared/LevelStage';
import { CrosswordBoard } from '../games/crossword/components/CrosswordBoard';
import { challengeCrossword } from '../content/challenges';
import { MenuScreen, type MenuItem } from '../components/ui/MenuScreen';
import { Home } from './Home';
import {
  BookIcon,
  TargetIcon,
  RepeatIcon,
  SunIcon,
  KeyIcon,
  GrammarIcon,
  GridIcon,
  TilesIcon,
  TrophyIcon,
} from '../components/ui/icons';
import { peekLearnedCount } from '../state/storage';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Statistics } from './Statistics';
import { Store } from './Store';
import { Settings } from './Settings';
import { Account } from './Account';
import { Subscription } from './Subscription';
import { ResetProgress } from './ResetProgress';
import { BlockWords, BlockWordsBanner } from './BlockWords';
import { FocusPool } from './FocusPool';
import { Learn } from '../games/learn/Learn';
import { usePlayer } from '../state/PlayerContext';
import { SETS } from '../content/vocab';
import { LANGS, getActiveLang } from '../content/lang/registry';
import { PROGRESSION } from '../state/progressionConfig';
import {
  currentLearnSetIndex,
  masteredSetCount,
  currentBlock,
  blockCount,
  blockWords,
  blockPracticeDone,
  grammarRoundsForBlock,
  practiceCount,
  cipherRoundCount,
  cipherSessionDone,
  crosswordRoundCount,
  crosswordSessionDone,
  hurdleRoundCount,
  hurdleSessionDone,
  recapDue,
  focusWordIds,
  focusPoolSize,
} from '../state/progression';
import { cipherRoundsForBlock } from '../content/cipherItems';
import { crosswordRoundsForBlock } from '../content/crosswords';
import { hurdleRoundsForBlock } from '../content/hurdleItems';

/**
 * The screen tree: each route's PARENT is the menu it belongs to. "Back" always
 * goes one level up this tree (never to whatever was visited before, and never
 * to a game), so e.g. a game's parent is its menu, not another game.
 */
const PARENT: Partial<Record<Route, Route>> = {
  languages: 'main',
  'lang-menu': 'languages',
  learn: 'lang-menu',
  practice: 'lang-menu',
  recap: 'lang-menu',
  'focus-pool': 'lang-menu',
  'daily-recap': 'lang-menu',
  'daily-recap-grammar': 'lang-menu',
  'block-words': 'practice',
  'fill-in-the-blanks': 'practice',
  grammar: 'practice',
  crossword: 'practice',
  hurdle: 'practice',
  'recap-cipher': 'recap',
  'recap-grammar': 'recap',
  'recap-crossword': 'recap',
  'recap-hurdle': 'recap',
  'recap-challenge': 'recap',
  'focus-learn': 'focus-pool',
  'focus-cipher': 'focus-pool',
  'focus-grammar': 'focus-pool',
  'focus-crossword': 'focus-pool',
  'focus-hurdle': 'focus-pool',
  challenge: 'practice',
  statistics: 'main',
  store: 'main',
  settings: 'main',
  account: 'settings',
  subscription: 'settings',
  reset: 'settings',
};
/** The canonical tree path from 'main' down to `route` (used as the nav stack). */
function pathTo(route: Route): Route[] {
  const path: Route[] = [route];
  let cur: Route = route;
  while (PARENT[cur]) {
    cur = PARENT[cur]!;
    path.unshift(cur);
  }
  return path;
}

export function App() {
  const { state, now, language, switchLanguage, recordRecapDone, forceRecapDue } = usePlayer();
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

  // Navigate to a route by its canonical tree path, so the stack is always a
  // clean path from 'main' (a game never lingers beneath a menu we navigated to).
  function navigate(r: Route) {
    const next = pathTo(r);
    window.history.pushState({ stack: next }, '');
    setStack(next);
  }
  // Back = up one level of the tree (the menu the current page belongs to).
  function back() {
    const parent = PARENT[route];
    if (parent) navigate(parent);
  }
  function goMain() {
    setConfirmMain(false);
    window.history.pushState({ stack: ['main'] }, '');
    setStack(['main']);
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
  const pTarget = hasPractice ? grammarRoundsForBlock(state, SETS, practiceIdx) : 0;
  const pgCount = hasPractice ? practiceCount(state, practiceIdx) : 0;
  const pcCount = hasPractice ? cipherRoundCount(state, practiceIdx) : 0;
  const pcTarget = hasPractice ? cipherRoundsForBlock(practiceIdx) : 0;
  const pxCount = hasPractice ? crosswordRoundCount(state, practiceIdx) : 0;
  const pxTarget = hasPractice ? crosswordRoundsForBlock(practiceIdx) : 0;
  const phCount = hasPractice ? hurdleRoundCount(state, practiceIdx) : 0;
  const phTarget = hasPractice ? hurdleRoundsForBlock(practiceIdx) : 0;
  const pGrammarDone = hasPractice ? blockPracticeDone(state, SETS, practiceIdx) : false;
  const pCipherDone = hasPractice ? cipherSessionDone(state, practiceIdx) : false;
  const pCrosswordDone = hasPractice ? crosswordSessionDone(state, practiceIdx) : false;
  const pHurdleDone = hasPractice ? hurdleSessionDone(state, practiceIdx) : false;
  const practiceComplete = hasPractice && pGrammarDone && pCipherDone && pCrosswordDone && pHurdleDone;
  // Combined "X/total" across all four Practice games.
  const pDoneCount = pgCount + pcCount + pxCount + phCount;
  const pTotalTarget = pTarget + pcTarget + pxTarget + phTarget;
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
  const focusN = focusPoolSize(state);
  const completedChallenges = [...(state.challengesDone ?? [])].sort((a, b) => a - b);

  const openLanguage = (code: string) => {
    switchLanguage(code);
    navigate('lang-menu');
  };
  // Per-language word counts for the language cards. The active language reads
  // live state; the others are peeked from their own (saved) namespace. Built
  // from the registry so every registered pack (German, Norwegian, French, …)
  // shows up automatically.
  const languageItems: MenuItem[] = LANGS.map((l) => {
    const count = language === l.code ? state.learnedWords.length : peekLearnedCount(l.code);
    return {
      icon: l.flag,
      label: l.name,
      sublabel: count > 0 ? `A1 · ${count} words learned` : l.level,
      onClick: () => openLanguage(l.code),
    };
  });
  const langTitle = getActiveLang().name;

  // The home "Continue" card: the single next real action for the active
  // language, computed from the same progression signals the menus use.
  let continueItem: MenuItem;
  if (recapDueNow) {
    continueItem = {
      icon: <SunIcon />,
      label: 'Daily Recap',
      sublabel: 'Keep your words fresh to keep going',
      badge: 'Required',
      emphasis: true,
      onClick: () => navigate('daily-recap-grammar'),
    };
  } else if (mustPractice) {
    continueItem = {
      icon: <TargetIcon />,
      label: `Practice ${langTitle}`,
      sublabel: 'Clear this block to unlock the next words',
      emphasis: true,
      onClick: () => navigate('practice'),
    };
  } else if (curIdx !== null) {
    continueItem = {
      icon: <BookIcon />,
      label: `Continue ${langTitle}`,
      sublabel: 'Pick up the next words',
      emphasis: true,
      onClick: () => navigate('learn'),
    };
  } else if (recapUnlocked) {
    continueItem = {
      icon: <RepeatIcon />,
      label: `Review ${langTitle}`,
      sublabel: 'Mixed recap of everything you know',
      emphasis: true,
      onClick: () => navigate('recap'),
    };
  } else {
    continueItem = {
      icon: <BookIcon />,
      label: `Continue ${langTitle}`,
      sublabel: 'Pick up the next words',
      emphasis: true,
      onClick: () => navigate('learn'),
    };
  }

  // When the daily recap is due, it's the only way forward — Learn/Practice/Recap lock.
  const langMenuItems: MenuItem[] = recapDueNow
    ? [
        {
          icon: <SunIcon />,
          label: 'Daily Recap',
          sublabel: 'Keep your words fresh to keep going',
          badge: 'Required',
          onClick: () => navigate('daily-recap-grammar'),
        },
        { icon: <BookIcon />, label: 'Learn', sublabel: 'Finish your daily recap first', badge: 'Locked', locked: true },
        { icon: <TargetIcon />, label: 'Practice', sublabel: 'Finish your daily recap first', badge: 'Locked', locked: true },
        { icon: <RepeatIcon />, label: 'Recap', sublabel: 'Finish your daily recap first', badge: 'Locked', locked: true },
      ]
    : [
        {
          icon: <BookIcon />,
          label: 'Learn',
          sublabel: mustPractice ? 'Finish Practice to unlock the next words' : 'Pick up the next words',
          status: learnStatus,
          progress: learnProgress,
          locked: mustPractice,
          onClick: mustPractice ? () => navigate('practice') : () => navigate('learn'),
        },
        {
          icon: <TargetIcon />,
          label: 'Practice',
          sublabel: practiceUnlocked ? 'Drill the new words to advance' : 'Learn a set to unlock practice',
          status: !practiceUnlocked || !hasPractice ? undefined : practiceComplete ? '✓' : `${pDoneCount}/${pTotalTarget}`,
          progress: practiceComplete ? 1 : !hasPractice ? 0 : pTotalTarget ? pDoneCount / pTotalTarget : 0,
          badge: !practiceUnlocked ? 'Locked' : mustPractice ? 'Required' : undefined,
          locked: !practiceUnlocked,
          onClick: practiceUnlocked ? () => navigate('practice') : undefined,
        },
        {
          icon: <RepeatIcon />,
          label: 'Recap',
          sublabel: recapUnlocked
            ? 'Mixed review of everything you know'
            : `Master 2 sets to unlock · ${masteredSets}/2`,
          status: recapUnlocked ? `${state.learnedWords.length} words` : undefined,
          badge: recapUnlocked ? undefined : 'Locked',
          locked: !recapUnlocked,
          onClick: recapUnlocked ? () => navigate('recap') : undefined,
        },
        // Focus pool: appears once you can recap, or as soon as you've missed a word.
        ...(recapUnlocked || focusN > 0
          ? [
              {
                icon: '◎',
                label: 'Focus Pool',
                sublabel: focusN > 0 ? 'Drill the words you’ve missed' : 'Words you miss in Practice gather here',
                status: focusN > 0 ? `${focusN} ${focusN === 1 ? 'word' : 'words'}` : undefined,
                onClick: () => navigate('focus-pool'),
              },
            ]
          : []),
        // DEV/TESTING: trigger the daily recap without waiting 24h. Dev builds only.
        ...(import.meta.env.DEV
          ? [
              {
                icon: '🔧',
                label: 'Dev: trigger daily recap',
                sublabel: 'Testing only',
                onClick: () => forceRecapDue(),
              },
            ]
          : []),
      ];

  const practiceItems: MenuItem[] = [
    {
      icon: <KeyIcon />,
      label: 'Letter Cipher',
      sublabel: 'Decode sentences built from this block’s new words',
      status: !hasPractice ? undefined : pCipherDone ? (practiceComplete ? 'Completed' : 'Done ✓') : `${pcCount}/${pcTarget}`,
      progress: !hasPractice ? 0 : pCipherDone ? 1 : pcTarget ? pcCount / pcTarget : 1,
      locked: !hasPractice || pCipherDone,
      onClick: hasPractice && !pCipherDone ? () => navigate('fill-in-the-blanks') : undefined,
    },
    {
      icon: <GrammarIcon />,
      label: 'Grammar',
      sublabel: 'A few article drills to clear this block',
      status: !hasPractice ? undefined : pGrammarDone ? (practiceComplete ? 'Completed' : 'Done ✓') : `${pgCount}/${pTarget}`,
      progress: !hasPractice ? 0 : pGrammarDone ? 1 : pgCount / pTarget,
      locked: !hasPractice || pGrammarDone,
      onClick: hasPractice && !pGrammarDone ? () => navigate('grammar') : undefined,
    },
    {
      icon: <GridIcon />,
      label: 'Crossword',
      sublabel: 'Fit this block’s leftover words into a grid',
      status: !hasPractice || !pxTarget ? undefined : pCrosswordDone ? (practiceComplete ? 'Completed' : 'Done ✓') : `${pxCount}/${pxTarget}`,
      progress: !hasPractice ? 0 : pCrosswordDone ? 1 : pxTarget ? pxCount / pxTarget : 1,
      locked: !hasPractice || pCrosswordDone,
      onClick: hasPractice && !pCrosswordDone ? () => navigate('crossword') : undefined,
    },
  ];
  // Hurdle only appears when the block actually has a straggler the crossword
  // couldn't place (often none). Before the block is learned, show it locked
  // alongside the others.
  if (!hasPractice || phTarget > 0) {
    practiceItems.push({
      icon: <TilesIcon />,
      label: 'Hurdle',
      sublabel: 'Spell the word the other games missed',
      status: !hasPractice ? undefined : pHurdleDone ? (practiceComplete ? 'Completed' : 'Done ✓') : `${phCount}/${phTarget}`,
      progress: !hasPractice ? 0 : pHurdleDone ? 1 : phTarget ? phCount / phTarget : 1,
      locked: !hasPractice || pHurdleDone,
      onClick: hasPractice && !pHurdleDone ? () => navigate('hurdle') : undefined,
    });
  }

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
    { icon: <KeyIcon />, label: 'Letter Cipher', sublabel: 'Decode sentences from everything you know', onClick: () => navigate('recap-cipher') },
    { icon: <GrammarIcon />, label: 'Grammar', sublabel: 'Articles across everything you know', onClick: () => navigate('recap-grammar') },
    { icon: <TilesIcon />, label: 'Hurdle', sublabel: 'Spell any word you’ve learned', onClick: () => navigate('recap-hurdle') },
    ...completedChallenges.map((b) => ({
      icon: <TrophyIcon />,
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
      screen = <MenuScreen title={langTitle} items={langMenuItems} onBack={back} onMain={requestMain} />;
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
                : 'Clear this block’s practice games to unlock the next words.'
          }
          items={practiceItems}
          banner={
            hasPractice ? (
              <BlockWordsBanner
                words={blockWords(SETS, practiceIdx)}
                onOpen={() => navigate('block-words')}
              />
            ) : undefined
          }
          footer={practiceFooter}
          onBack={back}
          onMain={requestMain}
        />
      );
      break;
    case 'block-words':
      screen = (
        <BlockWords
          words={hasPractice ? blockWords(SETS, practiceIdx) : []}
          blockLabel="Refresh these before you practise — they’re what this block drills."
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
    case 'crossword':
    case 'hurdle': {
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
    case 'recap-hurdle': {
      const Game = getGame('hurdle')?.component;
      screen = Game ? (
        <Game onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} scope="recap" />
      ) : null;
      break;
    }
    case 'focus-pool':
      screen = <FocusPool onBack={back} onMain={requestMain} onOpen={navigate} />;
      break;
    case 'focus-learn':
      screen = (
        <Learn
          onExit={back}
          onMain={requestMain}
          onPractice={() => navigate('focus-pool')}
          studyIds={focusWordIds(state)}
        />
      );
      break;
    case 'focus-cipher': {
      const Game = getGame('fill-in-the-blanks')?.component;
      screen = Game ? (
        <Game onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} scope="focus" />
      ) : null;
      break;
    }
    case 'focus-grammar': {
      const Game = getGame('grammar')?.component;
      screen = Game ? (
        <Game onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} scope="focus" />
      ) : null;
      break;
    }
    case 'focus-crossword': {
      const Game = getGame('crossword')?.component;
      screen = Game ? (
        <Game onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} scope="focus" />
      ) : null;
      break;
    }
    case 'focus-hurdle': {
      const Game = getGame('hurdle')?.component;
      screen = Game ? (
        <Game onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} scope="focus" />
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
            renderBoard={(item, controls) => <CrosswordBoard item={item} controls={controls} scope="recap" />}
          />
        ) : null;
      break;
    case 'challenge':
      screen = (
        <ChallengeCrossword onExit={back} onOpenSettings={() => navigate('settings')} onMain={requestMain} />
      );
      break;
    default:
      screen = (
        <Home
          langName={langTitle}
          streak={state.streak}
          wordsLearned={state.learnedWords.length}
          continueItem={continueItem}
          onLanguages={() => navigate('languages')}
          onStatistics={() => navigate('statistics')}
          onStore={() => navigate('store')}
          onSettings={() => navigate('settings')}
        />
      );
  }

  const pinned =
    route === 'fill-in-the-blanks' ||
    route === 'grammar' ||
    route === 'crossword' ||
    route === 'hurdle' ||
    route === 'recap-cipher' ||
    route === 'recap-grammar' ||
    route === 'recap-hurdle' ||
    route === 'focus-cipher' ||
    route === 'focus-grammar' ||
    route === 'focus-crossword' ||
    route === 'focus-hurdle' ||
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
