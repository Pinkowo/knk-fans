"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Initializer<T> = T | (() => T);

type UseLocalStorageResult<T> = [T, (value: T | ((previous: T) => T)) => void, () => void];

const isBrowser = typeof window !== "undefined";

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

  const setValue = useCallback(
    (valueOrUpdater: T | ((previous: T) => T)) => {
      setStoredValue((previous) => {
        const newValue = valueOrUpdater instanceof Function ? valueOrUpdater(previous) : valueOrUpdater;

        if (isBrowser) {
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          } catch (error) {
            console.warn(`useLocalStorage: failed to write key "${key}"`, error);
          }
        }

        return newValue;
      });
    },
    [key]
  );

  const resetValue = useCallback(() => {
    setStoredValue(() => readValue(key, initialValueRef.current));
    if (isBrowser) {
      window.localStorage.removeItem(key);
    }
  }, [key]);

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

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  return [storedValue, setValue, resetValue];
}
