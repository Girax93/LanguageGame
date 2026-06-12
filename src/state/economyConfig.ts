/**
 * ECONOMY — all tunable numbers for lives, focus (energy) and monetization
 * live here. Change a value and the whole app follows. Nothing else should
 * hard-code these numbers.
 */
export const ECONOMY = {
  /** Lives per level. Losing all of them fails the level. */
  livesPerLevel: 3,

  /** Focus (energy) cap and starting value for a new player. */
  focusMax: 5,
  focusStart: 5,

  /** Regen: +1 focus every this many milliseconds (default 20 minutes). */
  focusRegenMs: 20 * 60 * 1000,

  /** You need at least this much focus to START a level. */
  focusToStart: 1,
  /** Winning a level costs this much focus (success is free). */
  focusCostOnWin: 0,
  /** Losing a level costs this much focus. */
  focusCostOnFail: 1,

  /**
   * Monetization (STUBS — no real billing). See state/focus.ts:
   *  - buyFocusRefill(): instant refill to focusMax.
   *  - setSubscribed(true): unlimited focus (bypasses all focus checks).
   * The real IAP / store-billing call would wrap these.
   */
  iap: {
    refillPriceLabel: '$0.99',
    subscriptionPriceLabel: '$4.99 / mo',
  },
} as const;
