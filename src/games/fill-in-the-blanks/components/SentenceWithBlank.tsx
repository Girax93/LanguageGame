const BLANK = '___';

type BlankState = 'idle' | 'correct' | 'wrong';

interface Props {
  sentence: string;
  /** Word to show inside the blank once revealed. */
  filled?: string;
  state: BlankState;
}

/**
 * Renders a German sentence, replacing the "___" marker with a styled
 * blank slot. Once `filled` is provided the slot shows the answer.
 */
export function SentenceWithBlank({ sentence, filled, state }: Props) {
  const [before, after] = splitOnce(sentence, BLANK);

  const slotColor =
    state === 'correct'
      ? 'border-emerald-400 text-emerald-300'
      : state === 'wrong'
        ? 'border-rose-400 text-rose-300'
        : 'border-white/30 text-transparent';

  return (
    <p className="text-2xl font-semibold leading-relaxed sm:text-3xl">
      {before}
      <span
        className={`mx-1 inline-flex min-w-[3.5rem] items-center justify-center rounded-lg border-b-2 px-2 pb-0.5 align-baseline transition-colors ${slotColor}`}
      >
        {filled ?? ' '}
      </span>
      {after}
    </p>
  );
}

function splitOnce(text: string, marker: string): [string, string] {
  const i = text.indexOf(marker);
  if (i === -1) return [text, ''];
  return [text.slice(0, i), text.slice(i + marker.length)];
}
