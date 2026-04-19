import { useEffect, useState } from "react";

/**
 * Persisted state hook backed by localStorage.
 * Falls back to the initial value if storage is unavailable or parse fails.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or privacy mode — ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
