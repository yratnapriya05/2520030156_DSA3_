export const STORAGE_KEYS = {
  bookings: 'voyage_bookings_v1',
  seats: 'voyage_seats_v1',
  queue: 'voyage_queue_v1',
  search: 'voyage_search_v1',
  draft: 'voyage_draft_v1',
  account: 'voyage_account_v1',
};

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key) {
  localStorage.removeItem(key);
}

export function resetAllStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}
