/**
 * Stable sentence keying + filename slugs. The sentence key is a content hash
 * so the SAME text always maps to the same clip, and a generator tweak only
 * re-keys the sentences whose text actually changed. The app must hash with the
 * exact same function to look up sentence audio, so keep this in sync if reused.
 */

/** Collapse whitespace + trim; case/punctuation are meaningful and kept. */
export function normalizeSentence(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** FNV-1a 32-bit -> 8-char base36. Deterministic, dependency-free. */
export function hashText(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // >>> 0 to keep it unsigned, then pad to a stable width.
  return (h >>> 0).toString(36).padStart(7, '0');
}

/** Sentence key: s-<hash of normalized text>. */
export function sentenceKey(text: string): string {
  return 's-' + hashText(normalizeSentence(text));
}

/** Filename-safe slug: keep letters/numbers (incl. äöüßæøå), dashes elsewhere. */
export function slugify(s: string, maxWords = 6): string {
  const words = s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords);
  const slug = words.join('-');
  return slug || 'item';
}
