"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Initializer<T> = T | (() => T);

type UseLocalStorageResult<T> = [T, (value: T | ((previous: T) => T)) => void, () => void];

const isBrowser = typeof window !== "undefined";
const LOCAL_EVENT_NAME = "local-storage";

function readValue<T>(key: string, initialValue: Initializer<T>): T {
  if (!isBrowser) {
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue === null) {
      return typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;
    }

    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.warn(`useLocalStorage: failed to read key "${key}"`, error);
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: Initializer<T>
): UseLocalStorageResult<T> {
  const [storedValue, setStoredValue] = useState<T>(() => readValue(key, initialValue));
  const initialValueRef = useRef(initialValue);
  const broadcastTimeoutRef = useRef<number | null>(null);

  const broadcastValue = useCallback(
    (value: T) => {
      if (!isBrowser) {
        return;
      }
      if (broadcastTimeoutRef.current !== null) {
        window.clearTimeout(broadcastTimeoutRef.current);
      }
      broadcastTimeoutRef.current = window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(LOCAL_EVENT_NAME, {
            detail: { key, value },
          })
        );
        broadcastTimeoutRef.current = null;
      }, 0);
    },
    [key]
  );

  const setValue = useCallback(
    (valueOrUpdater: T | ((previous: T) => T)) => {
      setStoredValue((previous) => {
        const newValue = valueOrUpdater instanceof Function ? valueOrUpdater(previous) : valueOrUpdater;

        if (isBrowser) {
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
            broadcastValue(newValue);
          } catch (error) {
            console.warn(`useLocalStorage: failed to write key "${key}"`, error);
          }
        }

        return newValue;
      });
    },
    [broadcastValue, key]
  );

  const resetValue = useCallback(() => {
    setStoredValue(() => readValue(key, initialValueRef.current));
    if (isBrowser) {
      window.localStorage.removeItem(key);
      broadcastValue(readValue(key, initialValueRef.current));
    }
  }, [broadcastValue, key]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) {
        return;
      }

      setStoredValue(event.newValue ? (JSON.parse(event.newValue) as T) : readValue(key, initialValueRef.current));
    };
    const handleLocalEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string; value: T }>;
      if (customEvent.detail?.key !== key) {
        return;
      }
      setStoredValue(customEvent.detail.value);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(LOCAL_EVENT_NAME, handleLocalEvent as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LOCAL_EVENT_NAME, handleLocalEvent as EventListener);
      if (broadcastTimeoutRef.current !== null) {
        window.clearTimeout(broadcastTimeoutRef.current);
      }
    };
  }, [key, broadcastValue]);

  return [storedValue, setValue, resetValue];
}
