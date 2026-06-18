/**
 * DEV/TESTING aid: a small fixed button (always bottom-right) that completes the
 * current round as if it were solved, for quickly navigating the progression.
 * Remove or hide behind a flag before a real release.
 */
export function DevSkip({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      onClick={onSkip}
      aria-label="Skip this round (testing)"
      className="fixed bottom-4 right-4 z-50 rounded-full border border-line bg-card/90 px-3 py-2 text-xs font-medium text-taupe shadow-sm backdrop-blur transition hover:bg-sand hover:text-espresso active:scale-95"
    >
      Skip ⏭
    </button>
  );
}
