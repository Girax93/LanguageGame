/**
 * Focus Pool (Feature 4). Words the player missed in a FAILED Practice game
 * collect here (per language). The player can refresh them, then drill them in
 * any applicable game scoped to JUST these words — a word leaves the pool after
 * two correct-in-a-row in a focus game. Lives under the language menu.
 */
import { TopBar } from '../components/ui/TopBar';
import { Card, type MenuItem } from '../components/ui/MenuScreen';
import { BookIcon, KeyIcon, GrammarIcon, GridIcon, TilesIcon } from '../components/ui/icons';
import { usePlayer } from '../state/PlayerContext';
import { focusWordIds, isItemEligible } from '../state/progression';
import { PROGRESSION } from '../state/progressionConfig';
import { wordById, germanWithArticle, englishWithArticle } from '../content/vocab';
import { CIPHER_ITEMS } from '../content/cipherItems';
import { HURDLE_ITEMS } from '../content/hurdleItems';
import { buildFocusCrossword } from '../content/crosswords';
import type { Route } from './routes';

export function FocusPool({
  onBack,
  onMain,
  onOpen,
}: {
  onBack: () => void;
  onMain: () => void;
  onOpen: (r: Route) => void;
}) {
  const { state, clearFocusWord } = usePlayer();
  const ids = focusWordIds(state);
  const words = ids.map((id) => wordById(id)).filter((w): w is NonNullable<typeof w> => !!w);

  if (ids.length === 0) {
    return (
      <div className="flex flex-1 flex-col animate-fade-in">
        <TopBar title="Focus Pool" onBack={onBack} onMain={onMain} />
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
          <div className="text-4xl text-brown">◎</div>
          <h2 className="mt-5 font-serif text-2xl font-semibold text-espresso">Nothing to focus on</h2>
          <p className="mt-2 max-w-xs text-taupe">
            Words you miss in a Practice game gather here, so you can drill just those. Nice and clear
            for now.
          </p>
        </div>
      </div>
    );
  }

  // Which focus games actually have content for the current pool.
  const focus = new Set(ids);
  const hasCipher = CIPHER_ITEMS.some((i) => isItemEligible(i, state) && i.requires.some((r) => focus.has(r)));
  const hasGrammar = words.some((w) => w.gender);
  const hasHurdle = HURDLE_ITEMS.some((i) => focus.has(i.wordId) && isItemEligible(i, state));
  const hasCrossword = !!buildFocusCrossword(ids);

  const actions: MenuItem[] = [
    {
      icon: <BookIcon />,
      label: 'Learn these words',
      sublabel: 'A quick refresher before you drill',
      onClick: () => onOpen('focus-learn'),
    },
  ];
  if (hasCipher)
    actions.push({ icon: <KeyIcon />, label: 'Letter Cipher', sublabel: 'Decode sentences featuring your focus words', onClick: () => onOpen('focus-cipher') });
  if (hasGrammar)
    actions.push({ icon: <GrammarIcon />, label: 'Grammar', sublabel: 'Article drills for your focus nouns', onClick: () => onOpen('focus-grammar') });
  if (hasCrossword)
    actions.push({ icon: <GridIcon />, label: 'Crossword', sublabel: 'A grid built from your focus words', onClick: () => onOpen('focus-crossword') });
  if (hasHurdle)
    actions.push({ icon: <TilesIcon />, label: 'Hurdle', sublabel: 'Spell your focus words', onClick: () => onOpen('focus-hurdle') });

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Focus Pool" onBack={onBack} onMain={onMain} />
      <p className="mb-4 -mt-1 text-taupe">
        Words you’ve missed in Practice. Get one right twice in a row in a focus game to clear it.
      </p>

      <div className="mb-6 flex flex-col gap-2">
        {words.map((w) => {
          const streak = state.focusPool[w.id] ?? 0;
          return (
            <div key={w.id} className="card flex items-center gap-3 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base font-semibold text-espresso">{germanWithArticle(w)}</p>
                <p className="truncate text-sm text-taupe">{englishWithArticle(w)}</p>
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums text-taupe">
                {streak}/{PROGRESSION.masteryThreshold}
              </span>
              <button
                type="button"
                onClick={() => clearFocusWord(w.id)}
                aria-label={`Remove ${w.de} from the focus pool`}
                className="shrink-0 rounded-full px-2 py-1 text-taupe transition hover:bg-sand hover:text-espresso"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <h3 className="eyebrow mb-2">Drill just these words</h3>
      <div className="flex flex-col gap-3">
        {actions.map((item, i) => (
          <Card key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
