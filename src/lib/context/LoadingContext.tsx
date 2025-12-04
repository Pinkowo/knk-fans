"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import LoadingOverlay from "@/components/common/LoadingOverlay";
import type { AppLocale } from "@/i18n";
import type { LanguageLoadingState } from "@/types/ui-ux";

interface LoadingContextValue {
  state: LanguageLoadingState;
  beginLoading: (locale: AppLocale) => void;
  endLoading: () => void;
  reset: () => void;
}

const initialState: LanguageLoadingState = {
  isLoading: false,
  targetLocale: null,
  startedAt: null,
  pendingRequests: 0,
};

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LanguageLoadingState>(initialState);

  const beginLoading = useCallback((locale: AppLocale) => {
    setState((prev) => {
      const startedAt = prev.isLoading ? prev.startedAt : Date.now();
      return {
        isLoading: true,
        targetLocale: locale,
        startedAt,
        pendingRequests: prev.pendingRequests + 1,
      };
    });
  }, []);

  const endLoading = useCallback(() => {
    setState((prev) => {
      const nextPending = Math.max(0, prev.pendingRequests - 1);
      if (nextPending === 0) {
        return initialState;
      }

      return {
        ...prev,
        pendingRequests: nextPending,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  useEffect(() => {
    if (!state.isLoading || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [state.isLoading]);

  const value = useMemo(
    () => ({
      state,
      beginLoading,
      endLoading,
      reset,
    }),
    [state, beginLoading, endLoading, reset],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay isVisible={state.isLoading} targetLocale={state.targetLocale} />
    </LoadingContext.Provider>
  );
}

export function useLoadingState() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoadingState must be used within LoadingProvider");
  }

  return context;
}

export { initialState as initialLanguageLoadingState };
