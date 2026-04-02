/**
 * @module Store
 * Type-safe localStorage wrapper with JSON serialisation and SSR safety.
 *
 * All methods are no-ops on the server (window is undefined) and
 * swallow storage quota / parse errors gracefully.
 *
 * Usage:
 *   Store.set("theme", "dark");
 *   const theme = Store.get<string>("theme");   // → "dark" | null
 *   Store.remove("theme");
 */

// ─── Store class ──────────────────────────────────────────────────────────────

export class Store {
  /**
   * Retrieve and deserialise a stored value.
   * Returns null if the key does not exist or the stored value cannot be parsed.
   */
  static get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  /**
   * Serialise and persist a value.
   * Silently no-ops if localStorage is unavailable or quota is exceeded.
   */
  static set(key: string, value: unknown): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota exceeded or private browsing — ignore
    }
  }

  /**
   * Remove a single key.
   */
  static remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }

  /**
   * Clear all keys from localStorage.
   * Use with caution — this removes all data for the current origin.
   */
  static clear(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
  }

  /**
   * Check whether a key exists in storage.
   */
  static has(key: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }
}
