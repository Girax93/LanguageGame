/**
 * Learn micro-exercise UIs. Each single-word exercise reports its outcome once
 * via `onResult(correct)`; the orchestrator (`Learn.tsx`) records mastery and
 * builds the next step. `Pairs` is a group reinforcement: correct matches award
 * the word (`onMatch`), mismatches just shake (no penalty).
 */
import { useMemo, useState } from 'react';
import {
  germanWithArticle,
  englishWithArticle,
  answerMatches,
  articleFor,
  type VocabWord,
} from '../../content/vocab';
import { exampleSentenceFor } from '../../content/derive';
import { getActiveLang } from '../../content/lang/registry';
import { shuffle } from '../../lib/array';
import { Button } from '../../components/ui/Button';
import { scrambleLetters, type Step } from './engine';

// der/die/das get a consistent warm-palette colour so gender reads visually.
const ARTICLES: { art: string; gender: 'm' | 'f' | 'n'; cls: string }[] = [
  { art: 'der', gender: 'm', cls: 'text-brown' },
  { art: 'die', gender: 'f', cls: 'text-terracotta' },
  { art: 'das', gender: 'n', cls: 'text-ochre' },
];
function genderLabel(g: 'm' | 'f' | 'n'): string {
  return g === 'm' ? 'masculine' : g === 'f' ? 'feminine' : 'neuter';
}

/** A disabled speaker button - audio lands in Phase 5; this reserves its home. */
function Speaker() {
  return (
    <button
      type="button"
      disabled
      aria-label="Play audio (coming soon)"
      title="Audio coming soon"
      className="cursor-not-allowed rounded-full p-2 text-given/70"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M11 5L6 9H2v6h4l5 4z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      </svg>
    </button>
  );
}

export function IntroCard({
  word,
  knownIds,
  onNext,
}: {
  word: VocabWord;
  knownIds: ReadonlySet<string>;
  onNext: () => void;
}) {
  const example = useMemo(() => exampleSentenceFor(word.id, knownIds), [word.id, knownIds]);
  const topic = (word.tags ?? []).find(
    (t) => t !== 'function' && t !== 'question' && t !== 'communication',
  );
  const gi = word.gender ? ARTICLES.find((a) => a.gender === word.gender) : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="eyebrow">New word</p>
        <div className="mt-4 flex items-center gap-2">
          <p className="font-serif text-4xl font-semibold text-espresso">{germanWithArticle(word)}</p>
          <Speaker />
        </div>
        <p className="mt-3 text-xl text-taupe">{englishWithArticle(word)}</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {gi && (
            <span className={`rounded-full bg-sand px-3 py-1 text-xs font-semibold ${gi.cls}`}>
              {gi.art} · {genderLabel(word.gender!)}
            </span>
          )}
          {topic && (
            <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-taupe">{topic}</span>
          )}
        </div>

        {example && (
          <div className="mt-6 max-w-sm rounded-2xl border border-line bg-card/70 p-4">
            <p className="font-serif text-lg leading-snug text-espresso">{example.de}</p>
            <p className="mt-1 text-sm text-taupe">{example.en}</p>
          </div>
        )}
      </div>
      <Button className="mt-6 w-full" onClick={onNext}>
        Got it →
      </Button>
    </div>
  );
}

// shared feedback + option styling
function Feedback({
  correct,
  answer,
  onContinue,
}: {
  correct: boolean;
  answer: string;
  onContinue: () => void;
}) {
  return (
    <div className="mt-5 animate-fade-in">
      <p className={`mb-3 text-center font-semibold ${correct ? 'text-sage' : 'text-terracotta'}`}>
        {correct ? 'Correct! ✓' : `Answer: ${answer}`}
      </p>
      <Button className="w-full" onClick={onContinue}>
        Continue →
      </Button>
    </div>
  );
}

type OptState = 'idle' | 'correct' | 'wrong' | 'muted';
function optionClasses(s: OptState): string {
  const base =
    'rounded-2xl border px-4 py-4 text-lg font-medium transition active:scale-[0.99] disabled:cursor-default';
  switch (s) {
    case 'correct':
      return `${base} border-sage/60 bg-sage/15 text-espresso`;
    case 'wrong':
      return `${base} border-terracotta/60 bg-terracotta/10 text-terracotta`;
    case 'muted':
      return `${base} border-line bg-card text-taupe`;
    default:
      return `${base} border-line bg-card text-espresso hover:border-brown/40 hover:bg-sand`;
  }
}

export function Choice({
  step,
  onResult,
}: {
  step: Extract<Step, { kind: 'choice' }>;
  onResult: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const isCorrect = picked !== null && answerMatches(picked, step.answer);
  function stateFor(o: string): OptState {
    if (picked === null) return 'idle';
    if (answerMatches(o, step.answer)) return 'correct';
    if (o === picked) return 'wrong';
    return 'muted';
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-8 text-center">
        <p className="eyebrow">{step.label}</p>
        <p className="mt-4 font-serif text-4xl font-semibold text-espresso">{step.prompt}</p>
      </div>
      <div className="mt-auto grid grid-cols-1 gap-3 pt-8 sm:grid-cols-2">
        {step.options.map((o) => (
          <button
            key={o}
            disabled={picked !== null}
            onClick={() => setPicked(o)}
            className={optionClasses(stateFor(o))}
          >
            {o}
          </button>
        ))}
      </div>
      {picked !== null && (
        <Feedback correct={isCorrect} answer={step.answer} onContinue={() => onResult(isCorrect)} />
      )}
    </div>
  );
}

export function TypeIn({
  step,
  onResult,
}: {
  step: Extract<Step, { kind: 'type' }>;
  onResult: (correct: boolean) => void;
}) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const lang = getActiveLang().name;
  const isCorrect = answerMatches(value, step.answer);
  function submit() {
    if (!submitted && value.trim()) setSubmitted(true);
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-8 text-center">
        <p className="eyebrow">Type it in {lang}</p>
        <p className="mt-4 font-serif text-4xl font-semibold text-espresso">{step.prompt}</p>
      </div>
      <div className="mt-auto pt-8">
        <input
          autoFocus
          value={value}
          disabled={submitted}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder={`Type the ${lang} word`}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-2xl border border-line bg-card px-4 py-4 text-center text-xl text-espresso outline-none transition focus:border-brown/50"
        />
        {!submitted ? (
          <Button className="mt-4 w-full" onClick={submit} disabled={!value.trim()}>
            Check
          </Button>
        ) : (
          <Feedback correct={isCorrect} answer={step.answer} onContinue={() => onResult(isCorrect)} />
        )}
      </div>
    </div>
  );
}

export function Scramble({
  step,
  onResult,
}: {
  step: Extract<Step, { kind: 'scramble' }>;
  onResult: (correct: boolean) => void;
}) {
  const tiles = useMemo(
    () => scrambleLetters(step.answer).map((ch, i) => ({ id: i, ch })),
    [step.answer, step.word.id],
  );
  const [order, setOrder] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const placed = new Set(order);
  const built = order.map((id) => tiles[id].ch).join('');
  const isCorrect = built.toLowerCase() === step.answer.toLowerCase();
  const full = order.length === tiles.length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-8 text-center">
        <p className="eyebrow">Unscramble</p>
        <p className="mt-3 text-lg text-taupe">{englishWithArticle(step.word)}</p>
      </div>

      <div className="mt-8 flex min-h-[3.5rem] flex-wrap justify-center gap-2">
        {order.map((id, idx) => (
          <button
            key={id}
            disabled={submitted}
            onClick={() => setOrder(order.filter((_, i) => i !== idx))}
            className="tile border-brown/40 bg-sand text-espresso"
          >
            {tiles[id].ch}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {tiles.map((t) => (
          <button
            key={t.id}
            disabled={placed.has(t.id) || submitted}
            onClick={() => setOrder([...order, t.id])}
            className={`tile ${
              placed.has(t.id) ? 'border-line bg-card text-given' : 'border-line bg-card text-espresso hover:bg-sand'
            }`}
          >
            {t.ch}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-8">
        {!submitted ? (
          <Button className="w-full" onClick={() => setSubmitted(true)} disabled={!full}>
            Check
          </Button>
        ) : (
          <Feedback
            correct={isCorrect}
            answer={germanWithArticle(step.word)}
            onContinue={() => onResult(isCorrect)}
          />
        )}
      </div>
    </div>
  );
}

export function Gender({
  step,
  onResult,
}: {
  step: Extract<Step, { kind: 'gender' }>;
  onResult: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const answer = articleFor(step.word.gender!);
  const isCorrect = picked === answer;
  function classesFor(a: (typeof ARTICLES)[number]): string {
    const base =
      'rounded-2xl border px-2 py-4 font-serif text-xl font-semibold transition active:scale-[0.99] disabled:cursor-default';
    if (picked === null) return `${base} border-line bg-card ${a.cls} hover:bg-sand`;
    if (a.art === answer) return `${base} border-sage/60 bg-sage/15 text-espresso`;
    if (a.art === picked) return `${base} border-terracotta/60 bg-terracotta/10 text-terracotta`;
    return `${base} border-line bg-card text-given`;
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-8 text-center">
        <p className="eyebrow">Which article?</p>
        <p className="mt-4 font-serif text-4xl font-semibold text-espresso">{step.word.de}</p>
        <p className="mt-2 text-base text-taupe">{step.word.en}</p>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-3 pt-8">
        {ARTICLES.map((a) => (
          <button key={a.art} disabled={picked !== null} onClick={() => setPicked(a.art)} className={classesFor(a)}>
            {a.art}
          </button>
        ))}
      </div>
      {picked !== null && (
        <Feedback
          correct={isCorrect}
          answer={`${answer} ${step.word.de}`}
          onContinue={() => onResult(isCorrect)}
        />
      )}
    </div>
  );
}

export function Pairs({
  words,
  onMatch,
  onDone,
}: {
  words: VocabWord[];
  onMatch: (id: string) => void;
  onDone: () => void;
}) {
  const left = useMemo(() => shuffle(words.map((w) => ({ id: w.id, text: germanWithArticle(w) }))), [words]);
  const right = useMemo(() => shuffle(words.map((w) => ({ id: w.id, text: englishWithArticle(w) }))), [words]);
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [miss, setMiss] = useState(false);
  const lang = getActiveLang().name;

  function resolve(l: string | null, r: string | null) {
    if (!l || !r) return;
    if (l === r) {
      const next = new Set(matched);
      next.add(l);
      setMatched(next);
      onMatch(l);
      setSelL(null);
      setSelR(null);
      if (next.size === words.length) onDone();
    } else {
      setMiss(true);
      window.setTimeout(() => {
        setSelL(null);
        setSelR(null);
        setMiss(false);
      }, 450);
    }
  }
  function pickL(id: string) {
    if (matched.has(id) || miss) return;
    setSelL(id);
    resolve(id, selR);
  }
  function pickR(id: string) {
    if (matched.has(id) || miss) return;
    setSelR(id);
    resolve(selL, id);
  }
  function cls(id: string, sel: string | null): string {
    const base = 'rounded-2xl border px-3 py-4 text-base font-medium transition disabled:cursor-default';
    if (matched.has(id)) return `${base} border-sage/50 bg-sage/15 text-espresso opacity-60`;
    if (sel === id)
      return `${base} ${miss ? 'animate-shake border-terracotta/60 bg-terracotta/10' : 'border-brown/50 bg-sand'} text-espresso`;
    return `${base} border-line bg-card text-espresso hover:bg-sand`;
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-8 text-center">
        <p className="eyebrow">Match the pairs</p>
        <p className="mt-2 text-sm text-taupe">Tap a {lang} word, then its meaning.</p>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
        <div className="flex flex-col gap-3">
          {left.map((it) => (
            <button key={it.id} disabled={matched.has(it.id)} onClick={() => pickL(it.id)} className={cls(it.id, selL)}>
              {it.text}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {right.map((it) => (
            <button key={it.id} disabled={matched.has(it.id)} onClick={() => pickR(it.id)} className={cls(it.id, selR)}>
              {it.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
