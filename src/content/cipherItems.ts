/**
 * Letter-cipher sentences.
 *
 * Temporarily EMPTY: the old hand-authored sentences were tied to the previous
 * surface-form vocabulary. The generated sentence engine (with correct German
 * agreement) is being built in a follow-up; until then the cipher game shows an
 * empty state and does not gate progression. The type is preserved so the game
 * and board keep compiling.
 */
export interface CipherContentItem {
  id: string;
  sentence: string;
  translation: string;
  requires: string[];
  level: number;
}

export const CIPHER_ITEMS: CipherContentItem[] = [];
