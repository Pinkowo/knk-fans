"use client";

import { createContext, useContext, useMemo, useCallback } from "react";

import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { PlayerState, Track } from "@/types/player";
import { defaultPlayerState } from "@/types/player";

interface PlayerContextValue {
  state: PlayerState;
  setState: (updater: (prev: PlayerState) => PlayerState) => void;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  toggleVisible: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);
const STORAGE_KEY = "knk-player-state";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useLocalStorage<PlayerState>(STORAGE_KEY, defaultPlayerState);

  const playTrack = useCallback(
    (track: Track) =>
      setStateRaw((prev) => ({
        ...prev,
        isOpen: true,
        isPlaying: true,
        queue: [track, ...prev.queue.filter((item) => item.id !== track.id)],
        currentIndex: 0,
      })),
    [setStateRaw],
  );

  const togglePlay = useCallback(
    () => setStateRaw((prev) => ({ ...prev, isPlaying: !prev.isPlaying })),
    [setStateRaw],
  );
  const toggleVisible = useCallback(
    () => setStateRaw((prev) => ({ ...prev, isOpen: !prev.isOpen })),
    [setStateRaw],
  );

  const contextValue = useMemo<PlayerContextValue>(
    () => ({
      state,
      setState: setStateRaw,
      playTrack,
      togglePlay,
      toggleVisible,
    }),
    [state, setStateRaw, playTrack, togglePlay, toggleVisible],
  );

  return <PlayerContext.Provider value={contextValue}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}
