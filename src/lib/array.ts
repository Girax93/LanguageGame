/** Fisher–Yates shuffle; returns a new array, does not mutate the input. */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick up to `n` random items from `pool`, excluding anything in `exclude`. */
export function sampleExcluding<T>(
  pool: readonly T[],
  exclude: readonly T[],
  n: number,
): T[] {
  const filtered = pool.filter((x) => !exclude.includes(x));
  return shuffle(filtered).slice(0, n);
}
