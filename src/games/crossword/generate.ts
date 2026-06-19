/**
 * Procedural crossword layout generator. Two modes, both pure + deterministic
 * (seeded), so the same input always yields the same puzzle and it can be
 * unit-tested. Nothing is hand-authored — this scales to any word list.
 *  - generateLayout: packs a set of words into one OR MORE interlocking
 *    components, using EVERY word (a word that can't cross starts a new
 *    component — used by the dormant multi-grid challenge).
 *  - generateConnectedLayout: builds ONE connected component; words that can't
 *    cross are left UNPLACED and returned for the caller to re-home (the block
 *    Practice crossword uses this, sending its straggler to Hurdle).
 */
export type Dir = 'across' | 'down';
export interface GenWord {
  id: string;
  surface: string;
}
export interface GenEntry {
  wordId: string;
  row: number;
  col: number;
  dir: Dir;
}
export interface GenLayout {
  rows: number;
  cols: number;
  entries: GenEntry[];
}

const key = (r: number, c: number): string => `${r},${c}`;

/** Small deterministic PRNG (LCG). */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

interface Placed {
  id: string;
  surface: string;
  dir: Dir;
  row: number;
  col: number;
  cells: Array<[number, number]>;
}

interface BuildResult {
  placed: Placed[];
  minR: number;
  maxR: number;
  minC: number;
  maxC: number;
  components: number;
  /** Word ids skipped in single-component mode (couldn't cross the grid). */
  unplaced: string[];
}

function buildOne(order: GenWord[], singleComponent = false): BuildResult {
  const grid = new Map<string, string>();
  // Direction bitmask per cell: 1 = an across word uses it, 2 = a down word.
  // A cell may hold at most one across and one down word — never two in the
  // same direction (that would be a collinear overlap / merged word).
  const cellDir = new Map<string, number>();
  const placed: Placed[] = [];
  const unplaced: string[] = [];
  let minR = 0;
  let maxR = 0;
  let minC = 0;
  let maxC = 0;

  const has = (r: number, c: number): boolean => grid.has(key(r, c));
  const bit = (d: Dir): number => (d === 'across' ? 1 : 2);

  function canPlace(surf: string, r: number, c: number, dir: Dir): { cells: Array<[number, number]>; inter: number } | null {
    const n = surf.length;
    const preR = dir === 'down' ? r - 1 : r;
    const preC = dir === 'down' ? c : c - 1;
    const postR = dir === 'down' ? r + n : r;
    const postC = dir === 'down' ? c : c + n;
    if (has(preR, preC) || has(postR, postC)) return null;
    let inter = 0;
    const cells: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) {
      const rr = r + (dir === 'down' ? i : 0);
      const cc = c + (dir === 'across' ? i : 0);
      const k = key(rr, cc);
      const existing = grid.get(k);
      if (existing !== undefined) {
        if (existing !== surf[i]) return null;
        // A crossing must be perpendicular: reject if a word already runs
        // through this cell in the SAME direction (collinear overlap).
        if (((cellDir.get(k) ?? 0) & bit(dir)) !== 0) return null;
        inter++;
      } else if (dir === 'across') {
        if (has(rr - 1, cc) || has(rr + 1, cc)) return null;
      } else if (has(rr, cc - 1) || has(rr, cc + 1)) {
        return null;
      }
      cells.push([rr, cc]);
    }
    return { cells, inter };
  }

  function commit(w: GenWord, r: number, c: number, dir: Dir, cells: Array<[number, number]>): void {
    cells.forEach(([rr, cc], i) => {
      const k = key(rr, cc);
      grid.set(k, w.surface[i]);
      cellDir.set(k, (cellDir.get(k) ?? 0) | bit(dir));
      if (rr < minR) minR = rr;
      if (rr > maxR) maxR = rr;
      if (cc < minC) minC = cc;
      if (cc > maxC) maxC = cc;
    });
    placed.push({ id: w.id, surface: w.surface, dir, row: r, col: c, cells });
  }

  const seed0 = canPlace(order[0].surface, 0, 0, 'across')!;
  commit(order[0], 0, 0, 'across', seed0.cells);

  for (let w = 1; w < order.length; w++) {
    const word = order[w];
    let best: { inter: number; bbox: number; r: number; c: number; dir: Dir; cells: Array<[number, number]> } | null = null;
    for (const P of placed) {
      for (const [pr, pc] of P.cells) {
        const pch = grid.get(key(pr, pc))!;
        for (let j = 0; j < word.surface.length; j++) {
          if (word.surface[j] !== pch) continue;
          const dir: Dir = P.dir === 'across' ? 'down' : 'across';
          const r = dir === 'down' ? pr - j : pr;
          const c = dir === 'down' ? pc : pc - j;
          const res = canPlace(word.surface, r, c, dir);
          if (!res) continue;
          let nMinR = minR;
          let nMaxR = maxR;
          let nMinC = minC;
          let nMaxC = maxC;
          for (const [rr, cc] of res.cells) {
            if (rr < nMinR) nMinR = rr;
            if (rr > nMaxR) nMaxR = rr;
            if (cc < nMinC) nMinC = cc;
            if (cc > nMaxC) nMaxC = cc;
          }
          const bbox = nMaxR - nMinR + (nMaxC - nMinC);
          if (best === null || res.inter > best.inter || (res.inter === best.inter && bbox < best.bbox)) {
            best = { inter: res.inter, bbox, r, c, dir, cells: res.cells };
          }
        }
      }
    }
    if (best) {
      commit(word, best.r, best.c, best.dir, best.cells);
    } else if (singleComponent) {
      // Connected mode: a word that can't cross the single component is left
      // out (the caller routes it elsewhere — e.g. a lone straggler to Hurdle).
      unplaced.push(word.id);
    } else {
      const r0 = placed.length ? maxR + 2 : 0;
      const res = canPlace(word.surface, r0, 0, 'across')!;
      commit(word, r0, 0, 'across', res.cells);
    }
  }

  // Count connected components (words sharing a cell).
  const parent = placed.map((_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const sets = placed.map((P) => new Set(P.cells.map(([r, c]) => key(r, c))));
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      let shared = false;
      for (const k of sets[i]) {
        if (sets[j].has(k)) {
          shared = true;
          break;
        }
      }
      if (shared) parent[find(i)] = find(j);
    }
  }
  const components = new Set(placed.map((_, i) => find(i))).size;

  return { placed, minR, maxR, minC, maxC, components, unplaced };
}

/**
 * Generate a layout using EVERY word. Tries several deterministic orderings and
 * keeps the most compact (fewest components, then smallest grid).
 */
export function generateLayout(words: GenWord[], seed: number, tries = 100): GenLayout {
  const base = [...words].sort((a, b) =>
    b.surface.length - a.surface.length || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
  let best: BuildResult | null = null;
  let bestScore: [number, number, number] | null = null;
  for (let t = 0; t < tries; t++) {
    let order = base;
    if (t > 0) {
      order = [...base];
      const rnd = lcg(((seed + 1) * 2654435761) ^ (t * 40503));
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    const res = buildOne(order);
    const R = res.maxR - res.minR + 1;
    const C = res.maxC - res.minC + 1;
    const score: [number, number, number] = [res.components, Math.max(R, C), R * C];
    if (
      bestScore === null ||
      score[0] < bestScore[0] ||
      (score[0] === bestScore[0] && (score[1] < bestScore[1] || (score[1] === bestScore[1] && score[2] < bestScore[2])))
    ) {
      best = res;
      bestScore = score;
    }
  }
  const b = best!;
  const entries: GenEntry[] = b.placed.map((P) => ({
    wordId: P.id,
    row: P.row - b.minR,
    col: P.col - b.minC,
    dir: P.dir,
  }));
  return { rows: b.maxR - b.minR + 1, cols: b.maxC - b.minC + 1, entries };
}

export interface ConnectedLayout extends GenLayout {
  /** Word ids that couldn't be attached to the single connected component. */
  unplacedIds: string[];
}

/**
 * Like generateLayout, but builds ONE connected component. A word that can't
 * cross the growing grid is left UNPLACED (returned in `unplacedIds`) instead of
 * starting a separate mini-grid, so the result is always a single interlocking
 * puzzle. Tries several deterministic orderings and keeps the build that places
 * the most PRIORITY words, then the most words overall, then the most compact
 * grid. `priorityIds` are the words we most want in the grid (e.g. the block's
 * leftover words — whatever stays unplaced is the caller's straggler to re-home).
 */
export function generateConnectedLayout(
  words: GenWord[],
  seed: number,
  tries = 100,
  priorityIds: Set<string> = new Set(),
): ConnectedLayout {
  const base = [...words].sort((a, b) =>
    b.surface.length - a.surface.length || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
  let best: BuildResult | null = null;
  let bestScore: [number, number, number, number] | null = null;
  for (let t = 0; t < tries; t++) {
    let order = base;
    if (t > 0) {
      order = [...base];
      const rnd = lcg(((seed + 1) * 2654435761) ^ (t * 40503));
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    const res = buildOne(order, true);
    const R = res.maxR - res.minR + 1;
    const C = res.maxC - res.minC + 1;
    const priUnplaced = res.unplaced.filter((id) => priorityIds.has(id)).length;
    const score: [number, number, number, number] = [priUnplaced, res.unplaced.length, Math.max(R, C), R * C];
    if (
      bestScore === null ||
      score[0] < bestScore[0] ||
      (score[0] === bestScore[0] &&
        (score[1] < bestScore[1] ||
          (score[1] === bestScore[1] &&
            (score[2] < bestScore[2] || (score[2] === bestScore[2] && score[3] < bestScore[3])))))
    ) {
      best = res;
      bestScore = score;
    }
  }
  const b = best!;
  const entries: GenEntry[] = b.placed.map((P) => ({
    wordId: P.id,
    row: P.row - b.minR,
    col: P.col - b.minC,
    dir: P.dir,
  }));
  return {
    rows: b.maxR - b.minR + 1,
    cols: b.maxC - b.minC + 1,
    entries,
    unplacedIds: b.unplaced,
  };
}
