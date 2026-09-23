/**
 * localStorage that never throws (private mode, quota, no storage): reads fall
 * back to null, writes are best-effort. Every persisted UI preference goes through it.
 */
export const uiStorage = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { /* best-effort */ }
  },
  remove(key: string): void {
    try { localStorage.removeItem(key); } catch { /* best-effort */ }
  },
  /** Parsed JSON, or null when missing or corrupt. */
  getJson(key: string): unknown {
    const raw = uiStorage.get(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  setJson(key: string, value: unknown): void {
    uiStorage.set(key, JSON.stringify(value));
  },
};

const choiceKey = (key: string) => `ui.choice.${key}`;

/** The choice remembered under `key`, or null when missing or no longer one of `allowed`. */
export function storedChoice<T>(key: string, allowed: readonly T[]): T | null {
  const saved = uiStorage.getJson(choiceKey(key)) as T | null;
  return saved !== null && allowed.includes(saved) ? saved : null;
}

export function storeChoice(key: string, value: unknown): void {
  uiStorage.setJson(choiceKey(key), value);
}
