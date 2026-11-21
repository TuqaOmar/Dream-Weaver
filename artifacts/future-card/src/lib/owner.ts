/**
 * Every browser gets its own random, secret key (kept in localStorage).
 * It is sent with API requests so "My cards" only shows — and only lets you
 * edit or delete — the cards made on this browser.
 */
const STORAGE_KEY = 'future-card:owner-key';
let memoryKey: string | null = null;

function randomKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getOwnerKey(): string {
  try {
    let key = localStorage.getItem(STORAGE_KEY);
    if (!key || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) {
      key = randomKey();
      localStorage.setItem(STORAGE_KEY, key);
    }
    return key;
  } catch {
    // Storage blocked (private mode etc.): keep a key for this visit only.
    memoryKey ??= randomKey();
    return memoryKey;
  }
}

export function ownerHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getOwnerKey()}` };
}
