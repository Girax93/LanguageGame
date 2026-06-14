interface Props {
  focus: number;
  max: number;
  subscribed: boolean;
}

/** Compact focus (energy) display as dots, or ∞ for Pro. */
export function FocusPips({ focus, max, subscribed }: Props) {
  if (subscribed) {
    return <span className="text-base font-semibold text-ochre">∞</span>;
  }
  return (
    <div className="flex items-center gap-1" aria-label={`${focus} of ${max} focus`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i < focus ? 'bg-ochre' : 'bg-given/50'}`}
        />
      ))}
    </div>
  );
}
