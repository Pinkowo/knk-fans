"use client";

import { createContext, useContext, useMemo, useCallback } from "react";

import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { PlayerState } from "@/types/player";
import { defaultPlayerState } from "@/types/player";

interface PlayerContextValue {
  state: PlayerState;
  setState: (updater: (prev: PlayerState) => PlayerState) => void;
  togglePlay: () => void;
  toggleExpanded: () => void;
  setCurrentAlbum: (albumId: string) => void;
  setCurrentTrack: (trackId: string) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);
const STORAGE_KEY = "knk-player-state";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useLocalStorage<PlayerState>(STORAGE_KEY, defaultPlayerState);

  const togglePlay = useCallback(
    () => setStateRaw((prev) => ({ ...prev, isPlaying: !prev.isPlaying })),
    [setStateRaw],
  );
  const toggleExpanded = useCallback(
    () => setStateRaw((prev) => ({ ...prev, isExpanded: !prev.isExpanded })),
    [setStateRaw],
  );
  const setCurrentAlbum = useCallback(
    (albumId: string) =>
      setStateRaw((prev) => ({
        ...prev,
        currentAlbumId: albumId,
        currentTrackId: undefined,
      })),
    [setStateRaw],
  );
  const setCurrentTrack = useCallback(
    (trackId: string) =>
      setStateRaw((prev) => ({
        ...prev,
        currentTrackId: trackId,
      })),
    [setStateRaw],
  );

  const contextValue = useMemo<PlayerContextValue>(
    () => ({
      state,
      setState: setStateRaw,
      togglePlay,
      toggleExpanded,
      setCurrentAlbum,
      setCurrentTrack,
    }),
    [state, setStateRaw, togglePlay, toggleExpanded, setCurrentAlbum, setCurrentTrack],
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
