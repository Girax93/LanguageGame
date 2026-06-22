import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { CrosswordContentItem } from '../../../content/crosswords';
import { SkipButton, type BoardControls } from '../../_shared/LevelStage';
import { toUpperActive, isLetterActive } from '../../../content/lang/alphabet';
import { getActiveCode } from '../../../content/lang/registry';
import { Keyboard } from '../../fill-in-the-blanks/components/Keyboard';
import { buildCrossword, cellKey } from '../crossword';
import { clueFor } from '../../../content/clues';

interface Props {
  item: CrosswordContentItem;
  controls: BoardControls;
}

// Natural (zoom = 1) cell pitch in CSS px. The grid is rendered at this fixed
// size and a CSS transform handles fit / zoom / pan.
const CELL = 40;
const GAP = 4;
const PITCH = CELL + GAP;

interface View {
  zoom: number;
  x: number;
  y: number;
}

export function CrosswordBoard({ item, controls }: Props) {
  const built = useMemo(() => buildCrossword(item), [item.id]);

  const [entered, setEntered] = useState<Record<string, string>>({});
  const [selEntry, setSelEntry] = useState(0);
  const [active, setActive] = useState<string>(() => built.entries[0]?.cells[0] ?? '');
  const [wrong, setWrong] = useState<string | null>(null);
  const [showClues, setShowClues] = useState(false);
  const [lang, setLang] = useState<'de' | 'en'>('de');
  // The "native" clue side adapts to the active course language.
  const nativeCode = getActiveCode();
  const nativeLabel = nativeCode === 'no' ? 'NO' : 'DE';
  const acrossTitle = lang === 'de' ? (nativeCode === 'no' ? 'Vannrett' : 'Waagerecht') : 'Across';
  const downTitle = lang === 'de' ? (nativeCode === 'no' ? 'Loddrett' : 'Senkrecht') : 'Down';
  const done = useRef(false);

  // ── zoom / pan ────────────────────────────────────────────────────────────
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const bounds = useRef({ min: 0.4, max: 3 });

  const naturalW = built.cols * CELL + (built.cols - 1) * GAP;
  const naturalH = built.rows * CELL + (built.rows - 1) * GAP;

  const clampPan = useCallback(
    (x: number, y: number, zoom: number): { x: number; y: number } => {
      const vp = viewportRef.current;
      if (!vp) return { x, y };
      const vw = vp.clientWidth;
      const vh = vp.clientHeight;
      const gx = naturalW * zoom;
      const gy = naturalH * zoom;
      const loX = Math.min(0, vw - gx);
      const hiX = Math.max(0, vw - gx);
      const loY = Math.min(0, vh - gy);
      const hiY = Math.max(0, vh - gy);
      return { x: Math.min(hiX, Math.max(loX, x)), y: Math.min(hiY, Math.max(loY, y)) };
    },
    [naturalW, naturalH],
  );

  const fitView = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp || vp.clientWidth === 0) return;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const fit = Math.min(vw / naturalW, vh / naturalH);
    const zoom = Math.min(fit, 1.3);
    bounds.current = { min: Math.min(fit, 0.5), max: 3 };
    setView({ zoom, x: (vw - naturalW * zoom) / 2, y: (vh - naturalH * zoom) / 2 });
  }, [naturalW, naturalH]);

  // Fit the whole puzzle on first layout (and when the puzzle changes).
  useLayoutEffect(() => {
    let raf = 0;
    const tryFit = () => {
      const vp = viewportRef.current;
      if (vp && vp.clientWidth > 0 && vp.clientHeight > 0) fitView();
      else raf = requestAnimationFrame(tryFit);
    };
    tryFit();
    return () => cancelAnimationFrame(raf);
  }, [fitView]);

  // Keep the active cell on screen while typing (minimal nudge).
  const ensureVisible = useCallback(
    (key: string) => {
      const cell = built.cells.get(key);
      const vp = viewportRef.current;
      if (!cell || !vp) return;
      const v = viewRef.current;
      const x0 = v.x + cell.c * PITCH * v.zoom;
      const y0 = v.y + cell.r * PITCH * v.zoom;
      const size = CELL * v.zoom;
      const vw = vp.clientWidth;
      const vh = vp.clientHeight;
      const M = 8;
      let nx = v.x;
      let ny = v.y;
      if (x0 < M) nx += M - x0;
      else if (x0 + size > vw - M) nx -= x0 + size - (vw - M);
      if (y0 < M) ny += M - y0;
      else if (y0 + size > vh - M) ny -= y0 + size - (vh - M);
      if (nx !== v.x || ny !== v.y) {
        const p = clampPan(nx, ny, v.zoom);
        setView({ zoom: v.zoom, x: p.x, y: p.y });
      }
    },
    [built, clampPan],
  );
  useEffect(() => {
    if (active) ensureVisible(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const centerOnEntry = useCallback(
    (i: number) => {
      const e = built.entries[i];
      const vp = viewportRef.current;
      if (!e || !vp) return;
      const v = viewRef.current;
      let minc = Infinity;
      let maxc = -Infinity;
      let minr = Infinity;
      let maxr = -Infinity;
      for (const k of e.cells) {
        const c = built.cells.get(k)!;
        if (c.c < minc) minc = c.c;
        if (c.c > maxc) maxc = c.c;
        if (c.r < minr) minr = c.r;
        if (c.r > maxr) maxr = c.r;
      }
      const cx = ((minc + maxc + 1) / 2) * PITCH - GAP / 2;
      const cy = ((minr + maxr + 1) / 2) * PITCH - GAP / 2;
      const p = clampPan(vp.clientWidth / 2 - cx * v.zoom, vp.clientHeight / 2 - cy * v.zoom, v.zoom);
      setView({ zoom: v.zoom, x: p.x, y: p.y });
    },
    [built, clampPan],
  );

  // Pointer-driven pan (1 finger) + pinch zoom (2 fingers). Mouse wheel zooms.
  const G = useRef({
    pts: new Map<number, { x: number; y: number }>(),
    mode: 'none' as 'none' | 'pan' | 'pinch',
    moved: false,
    startPan: { x: 0, y: 0 },
    startZoom: 1,
    startDist: 0,
    startMid: { x: 0, y: 0 },
    startClient: { x: 0, y: 0 },
  });

  function cellAtClient(clientX: number, clientY: number): string | null {
    const vp = viewportRef.current;
    if (!vp) return null;
    const r = vp.getBoundingClientRect();
    const v = viewRef.current;
    const nx = (clientX - r.left - v.x) / v.zoom;
    const ny = (clientY - r.top - v.y) / v.zoom;
    const col = Math.floor(nx / PITCH);
    const row = Math.floor(ny / PITCH);
    if (col < 0 || row < 0 || col >= built.cols || row >= built.rows) return null;
    if (nx - col * PITCH > CELL || ny - row * PITCH > CELL) return null; // gap
    const key = cellKey(row, col);
    return built.cells.has(key) ? key : null;
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const vp = viewportRef.current;
    if (!vp) return;
    vp.setPointerCapture(e.pointerId);
    const g = G.current;
    g.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const v = viewRef.current;
    if (g.pts.size === 1) {
      g.mode = 'pan';
      g.moved = false;
      g.startPan = { x: v.x, y: v.y };
      g.startClient = { x: e.clientX, y: e.clientY };
    } else if (g.pts.size === 2) {
      const [a, b] = [...g.pts.values()];
      const r = vp.getBoundingClientRect();
      g.mode = 'pinch';
      g.moved = true;
      g.startDist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      g.startMid = { x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top };
      g.startZoom = v.zoom;
      g.startPan = { x: v.x, y: v.y };
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const g = G.current;
    if (!g.pts.has(e.pointerId)) return;
    g.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const vp = viewportRef.current;
    if (!vp) return;
    const v = viewRef.current;
    if (g.mode === 'pan' && g.pts.size === 1) {
      const dx = e.clientX - g.startClient.x;
      const dy = e.clientY - g.startClient.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
      const p = clampPan(g.startPan.x + dx, g.startPan.y + dy, v.zoom);
      setView({ zoom: v.zoom, x: p.x, y: p.y });
    } else if (g.mode === 'pinch' && g.pts.size >= 2) {
      const [a, b] = [...g.pts.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const r = vp.getBoundingClientRect();
      const mid = { x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top };
      let zoom = g.startZoom * (dist / g.startDist);
      zoom = Math.min(bounds.current.max, Math.max(bounds.current.min, zoom));
      const nat = { x: (g.startMid.x - g.startPan.x) / g.startZoom, y: (g.startMid.y - g.startPan.y) / g.startZoom };
      const p = clampPan(mid.x - nat.x * zoom, mid.y - nat.y * zoom, zoom);
      setView({ zoom, x: p.x, y: p.y });
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const g = G.current;
    const wasTap = g.mode === 'pan' && !g.moved && g.pts.size === 1;
    g.pts.delete(e.pointerId);
    try {
      viewportRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (wasTap) {
      const key = cellAtClient(e.clientX, e.clientY);
      if (key) onCellTap(key);
    }
    if (g.pts.size === 1) {
      const pt = [...g.pts.values()][0];
      g.mode = 'pan';
      g.moved = true; // continuing from a pinch — don't treat as a tap
      g.startPan = { x: viewRef.current.x, y: viewRef.current.y };
      g.startClient = { x: pt.x, y: pt.y };
    } else if (g.pts.size === 0) {
      g.mode = 'none';
    }
  }

  // Native non-passive wheel listener so we can zoom without scrolling the page.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const r = vp!.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const v = viewRef.current;
      let zoom = v.zoom * Math.exp(-e.deltaY * 0.0015);
      zoom = Math.min(bounds.current.max, Math.max(bounds.current.min, zoom));
      const nat = { x: (px - v.x) / v.zoom, y: (py - v.y) / v.zoom };
      const p = clampPan(px - nat.x * zoom, py - nat.y * zoom, zoom);
      setView({ zoom, x: p.x, y: p.y });
    }
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, [clampPan]);

  // ── puzzle logic ──────────────────────────────────────────────────────────
  const sageCells = useMemo(() => {
    const s = new Set<string>();
    for (const e of built.entries) {
      if (e.cells.every((k) => entered[k])) for (const k of e.cells) s.add(k);
    }
    return s;
  }, [built, entered]);

  const selectedEntry = built.entries[selEntry];
  const selCells = useMemo(() => new Set(selectedEntry?.cells ?? []), [selectedEntry]);

  const advanceFrom = useCallback(
    (key: string, map: Record<string, string>) => {
      const entry = built.entries[selEntry];
      const idx = entry.cells.indexOf(key);
      for (let s = 1; s <= entry.cells.length; s++) {
        const k = entry.cells[(idx + s) % entry.cells.length];
        if (!map[k]) {
          setActive(k);
          return;
        }
      }
      for (let s = 1; s <= built.entries.length; s++) {
        const e = built.entries[(selEntry + s) % built.entries.length];
        const empty = e.cells.find((k) => !map[k]);
        if (empty) {
          setSelEntry(e.index);
          setActive(empty);
          return;
        }
      }
    },
    [built, selEntry],
  );

  const pressLetter = useCallback(
    (letter: string) => {
      if (done.current || !active) return;
      const cell = built.cells.get(active);
      if (!cell) return;
      if (entered[active]) {
        advanceFrom(active, entered);
        return;
      }
      if (cell.answer === letter) {
        const next = { ...entered, [active]: letter };
        setEntered(next);
        if (Object.keys(next).length === built.total) {
          done.current = true;
          controls.onSolved();
          return;
        }
        advanceFrom(active, next);
      } else {
        const k = active;
        setWrong(k);
        window.setTimeout(() => setWrong((w) => (w === k ? null : w)), 400);
        controls.onWrong();
      }
    },
    [active, entered, built, controls, advanceFrom],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.length === 1) {
        const up = toUpperActive(e.key);
        if (isLetterActive(up)) pressLetter(up);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressLetter]);

  function onCellTap(key: string) {
    const cell = built.cells.get(key);
    if (!cell) return;
    const cands = [cell.across, cell.down].filter((x) => x !== undefined) as number[];
    if (cands.length === 0) return;
    let target: number;
    if (cands.includes(selEntry) && cands.length > 1) target = cands.find((x) => x !== selEntry)!;
    else if (cands.includes(selEntry)) target = selEntry;
    else target = cands[0];
    setSelEntry(target);
    setActive(key);
  }

  function selectClue(i: number) {
    const e = built.entries[i];
    setSelEntry(i);
    setActive(e.cells.find((k) => !entered[k]) ?? e.cells[0]);
    setShowClues(false);
    centerOnEntry(i);
  }

  const across = built.entries.filter((e) => e.dir === 'across');
  const down = built.entries.filter((e) => e.dir === 'down');

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* top region: clue bar + grid + clues overlay; the keyboard sits below and is never covered */}
      <div className="relative flex min-h-0 flex-1 flex-col">
      {/* selected clue + controls */}
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <p className="min-w-0 flex-1 text-sm text-espresso">
          {selectedEntry && (
            <>
              <span className="font-semibold tabular-nums">{selectedEntry.number}</span>
              <span className="text-taupe"> {selectedEntry.dir === 'across' ? 'Across' : 'Down'} · </span>
              <span>{clueFor(selectedEntry.wordId, lang)}</span>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={fitView}
          aria-label="Fit puzzle to screen"
          className="shrink-0 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-brown transition hover:bg-[#ddcdb2]"
        >
          Fit
        </button>
        <button
          type="button"
          onClick={() => setShowClues((s) => !s)}
          className="shrink-0 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-brown transition hover:bg-[#ddcdb2]"
        >
          Clues
        </button>
      </div>

      {/* zoom/pan viewport — only the grid transforms; chrome stays put */}
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative min-h-0 flex-1 touch-none select-none overflow-hidden rounded-xl bg-page"
        style={{ touchAction: 'none' }}
      >
        <div
          className="absolute left-0 top-0 grid will-change-transform"
          style={{
            gridTemplateColumns: `repeat(${built.cols}, ${CELL}px)`,
            gap: `${GAP}px`,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {Array.from({ length: built.rows }).flatMap((_, r) =>
            Array.from({ length: built.cols }).map((__, c) => {
              const key = cellKey(r, c);
              const cell = built.cells.get(key);
              if (!cell) return <div key={key} style={{ width: CELL, height: CELL }} />;
              const isWrong = wrong === key;
              const isActive = active === key;
              const box = isWrong
                ? 'border-terracotta bg-terracotta/10 text-terracotta animate-shake'
                : sageCells.has(key)
                  ? 'border-sage/60 bg-sage/20 text-espresso'
                  : isActive
                    ? 'border-brown bg-sand text-espresso ring-2 ring-brown/40'
                    : selCells.has(key)
                      ? 'border-brown/40 bg-sand/50 text-espresso'
                      : 'border-line bg-card text-espresso';
              return (
                <div
                  key={key}
                  style={{ width: CELL, height: CELL }}
                  className={['relative flex items-center justify-center rounded-md border-2 font-serif text-lg font-semibold uppercase', box].join(' ')}
                >
                  {cell.number && (
                    <span className="absolute left-0.5 top-0 text-[9px] font-medium leading-tight text-taupe">
                      {cell.number}
                    </span>
                  )}
                  {entered[key] ?? ''}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* peek handle — a tiny nub on the screen edge; tap to open the drawer */}
      {!showClues && (
        <button
          type="button"
          onClick={() => setShowClues(true)}
          aria-label="Open clues"
          className="absolute -left-5 top-1/2 z-30 -translate-y-1/2 rounded-r-md bg-card/95 py-2.5 pl-1 pr-1.5 text-taupe shadow-sm ring-1 ring-line transition hover:bg-sand hover:text-espresso"
        >
          <span aria-hidden className="text-[11px] leading-none">›</span>
        </button>
      )}

      {/* clues — a floating drawer that slides out from the left screen edge */}
      <div className={`absolute inset-y-0 -left-5 right-0 z-20 ${showClues ? '' : 'pointer-events-none'}`}>
        {/* transparent tap-catcher: tap outside the drawer to close (no dim) */}
        <div className="absolute inset-0" onClick={() => setShowClues(false)} />
        <div
          className={`absolute left-0 top-4 bottom-4 flex w-[76%] max-w-[15rem] flex-col rounded-2xl bg-card shadow-xl transition duration-200 ${showClues ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
            <h3 className="font-serif text-lg font-semibold text-espresso">Clues</h3>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-full bg-sand text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLang('de')}
                  className={`px-3 py-1.5 transition ${lang === 'de' ? 'bg-brown text-cream' : 'text-brown'}`}
                >
                  {nativeLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 transition ${lang === 'en' ? 'bg-brown text-cream' : 'text-brown'}`}
                >
                  EN
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowClues(false)}
                aria-label="Close clues"
                className="rounded-full p-1.5 text-taupe transition hover:bg-sand hover:text-espresso"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-3">
            <ClueGroup title={acrossTitle} entries={across} selEntry={selEntry} onPick={selectClue} done={sageCells} lang={lang} />
            <ClueGroup title={downTitle} entries={down} selEntry={selEntry} onPick={selectClue} done={sageCells} lang={lang} />
          </div>
        </div>
      </div>
      </div>

      {/* keyboard — outside the clues overlay so it is never covered */}
      <div className="mt-4 shrink-0 border-t border-line bg-page pt-2 pb-2">
        <div className="mb-2 flex justify-end">
          <SkipButton onSkip={controls.onSkip} />
        </div>
        <Keyboard onKey={pressLetter} stateFor={() => 'idle'} />
      </div>
    </div>
  );
}

interface GroupProps {
  title: string;
  entries: { index: number; number: number; wordId: string; cells: string[] }[];
  selEntry: number;
  onPick: (i: number) => void;
  done: Set<string>;
  lang: 'de' | 'en';
}

function ClueGroup({ title, entries, selEntry, onPick, done, lang }: GroupProps) {
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-taupe">{title}</h4>
      <ul className="space-y-1">
        {entries.map((e) => {
          const complete = e.cells.every((k) => done.has(k));
          return (
            <li key={e.index}>
              <button
                type="button"
                onClick={() => onPick(e.index)}
                className={[
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition',
                  selEntry === e.index ? 'bg-sand text-espresso' : 'hover:bg-sand/60',
                  complete ? 'text-taupe line-through' : 'text-espresso',
                ].join(' ')}
              >
                <span className="w-5 shrink-0 font-semibold tabular-nums text-brown">{e.number}</span>
                <span>{clueFor(e.wordId, lang)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
