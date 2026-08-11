const STORAGE_KEY = "reach.guestGamesPlayed";
export const GUEST_GAME_LIMIT = 3;

export function getGuestGamesPlayed(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function incrementGuestGamesPlayed(): number {
  const next = getGuestGamesPlayed() + 1;
  window.localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}
