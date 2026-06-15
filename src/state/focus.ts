/**
 * Pure focus (energy) + lives economy math. No React, no storage — just
 * state-in / state-out so it can be unit-tested. All numbers come from
 * ECONOMY (state/economyConfig.ts).
 */
import { ECONOMY } from './economyConfig';
import type { PlayerState } from './types';

/** Apply offline/elapsed-time focus regen up to `now`. */
export function applyRegen(s: PlayerState, now: number): PlayerState {
  if (s.subscribed || s.focus >= ECONOMY.focusMax) return s;
  const elapsed = now - s.lastFocusRegenAt;
  if (elapsed < ECONOMY.focusRegenMs) return s;

  const gained = Math.floor(elapsed / ECONOMY.focusRegenMs);
  const focus = Math.min(ECONOMY.focusMax, s.focus + gained);
  // Advance the anchor by whole regen steps; if we hit the cap, re-anchor to now.
  const lastFocusRegenAt =
    focus >= ECONOMY.focusMax ? now : s.lastFocusRegenAt + gained * ECONOMY.focusRegenMs;
  return { ...s, focus, lastFocusRegenAt };
}

/** Milliseconds until the next focus point, or null if full / unlimited. */
export function timeToNextFocusMs(s: PlayerState, now: number): number | null {
  if (s.subscribed || s.focus >= ECONOMY.focusMax) return null;
  const since = (now - s.lastFocusRegenAt) % ECONOMY.focusRegenMs;
  return ECONOMY.focusRegenMs - since;
}

/** Can the player start a level right now? */
export function canStartLevel(s: PlayerState): boolean {
  return s.subscribed || s.focus >= ECONOMY.focusToStart;
}

/**
 * Record the result of a level.
 *  - win:  +1 levelsWon, focus unchanged (success is free).
 *  - loss: focus -= focusCostOnFail (never below 0); starts the regen timer
 *          if focus was full. Subscribers never lose focus.
 */
export function recordLevelResult(
  s: PlayerState,
  won: boolean,
  now: number,
): PlayerState {
  if (won) {
    const focus = Math.max(0, s.focus - ECONOMY.focusCostOnWin);
    return { ...s, levelsWon: s.levelsWon + 1, focus };
  }
  if (s.subscribed) return s;
  const wasFull = s.focus >= ECONOMY.focusMax;
  const focus = Math.max(0, s.focus - ECONOMY.focusCostOnFail);
  return { ...s, focus, lastFocusRegenAt: wasFull ? now : s.lastFocusRegenAt };
}

/**
 * Like recordLevelResult, but a WIN does NOT advance levelsWon. Used by Recap
 * review, which is optional spaced practice and must not drive the
 * games-to-advance gate (only Practice unlocks new word sets). A loss still
 * costs focus exactly like a normal level.
 */
export function recordLevelResultNoGate(
  s: PlayerState,
  won: boolean,
  now: number,
): PlayerState {
  if (won) {
    const focus = Math.max(0, s.focus - ECONOMY.focusCostOnWin);
    return { ...s, focus };
  }
  if (s.subscribed) return s;
  const wasFull = s.focus >= ECONOMY.focusMax;
  const focus = Math.max(0, s.focus - ECONOMY.focusCostOnFail);
  return { ...s, focus, lastFocusRegenAt: wasFull ? now : s.lastFocusRegenAt };
}

/** STUB monetization: instant refill to full. (Wrap with real IAP later.) */
export function buyFocusRefill(s: PlayerState, now: number): PlayerState {
  return { ...s, focus: ECONOMY.focusMax, lastFocusRegenAt: now };
}

/** STUB monetization: toggle the unlimited-focus subscription. */
export function setSubscribed(s: PlayerState, value: boolean, now: number): PlayerState {
  return {
    ...s,
    subscribed: value,
    focus: value ? ECONOMY.focusMax : s.focus,
    lastFocusRegenAt: now,
  };
}

/** Lives a level starts with. */
export function startingLives(): number {
  return ECONOMY.livesPerLevel;
}
