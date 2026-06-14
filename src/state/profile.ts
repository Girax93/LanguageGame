/** A local "account" profile (no backend) — just a label over on-device progress. */
const KEY = 'languagegames:profile';

export interface Profile {
  username: string;
  email: string;
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { username: 'Learner', email: '', ...(JSON.parse(raw) as Partial<Profile>) };
  } catch {
    /* ignore */
  }
  return { username: 'Learner', email: '' };
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
