/**
 * Daily streak — "consecutive days with any activity". Pure + React-free so it's
 * trivially testable. Stored as a day-index so it's timezone-stable within a
 * device and cheap to compare. Wired in `PlayerContext` onto the main activity
 * actions (answering a word, finishing a level, completing a daily recap).
 */
import type { PlayerState } from './types';

/** Local day index: whole days since the epoch in the device's local time. */
export function dayIndex(now: number): number {
  const offsetMs = new Date(now).getTimezoneOffset() * 60_000;
  return Math.floor((now - offsetMs) / 86_400_000);
}

/**
 * Record activity at `now`. Same day → unchanged. Next day → streak + 1.
 * Any gap (or first ever activity) → streak resets to 1.
 */
export function touchStreak(s: PlayerState, now: number): PlayerState {
  const today = dayIndex(now);
  if (s.lastActiveDay === today) return s; // already counted today
  const continued = s.lastActiveDay === today - 1;
  return { ...s, streak: continued ? s.streak + 1 : 1, lastActiveDay: today };
}
