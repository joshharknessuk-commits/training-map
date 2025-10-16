const isBrowser = typeof window !== 'undefined';

interface StoredValue<T> {
  value: T;
  expiresAt: number;
}

export function getWithTTL<T>(key: string): T | null {
  if (!isBrowser) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const record = JSON.parse(raw) as StoredValue<T>;
    if (typeof record.expiresAt !== 'number' || record.expiresAt < Date.now()) {
      window.localStorage.removeItem(key);
      return null;
    }

    return record.value;
  } catch (error) {
    console.warn('[storage] Failed to parse cached value', error);
    window.localStorage.removeItem(key);
    return null;
  }
}

export function setWithTTL<T>(key: string, value: T, ttlMs: number): void {
  if (!isBrowser) {
    return;
  }

  const record: StoredValue<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };

  try {
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch (error) {
    console.warn('[storage] Failed to save value', error);
  }
}
