interface Props {
  total: number;
  remaining: number;
}

/** Lives display. Filled hearts = remaining, hollow = lost. */
export function Hearts({ total, remaining }: Props) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${remaining} of ${total} lives`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < remaining ? 'text-rose-400' : 'text-white/15'}>
          {i < remaining ? '♥' : '♡'}
        </span>
      ))}
    </div>
  );
}
