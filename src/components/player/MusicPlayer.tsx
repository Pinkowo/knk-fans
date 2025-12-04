"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import YouTube from "react-youtube";
import type { YouTubeEvent, YouTubePlayer } from "react-youtube";

import { MUSIC_PLAYER_COLLAPSE_EVENT, PET_PANEL_CLOSE_EVENT } from "@/lib/constants/panels";
import { usePlayer } from "@/lib/context/PlayerContext";
import type { PlayerAlbum, PlayerTrack } from "@/types/player";

interface MusicPlayerProps {
  library: PlayerAlbum[];
}

interface SelectorPanelProps {
  title: string;
  items: Array<{ id: string; label: string; active: boolean }>;
  onSelect: (id: string) => void;
  onClose: () => void;
  closeLabel: string;
}

export default function MusicPlayer({ library }: MusicPlayerProps) {
  const t = useTranslations("player");
  const { state, togglePlay, toggleExpanded, setCurrentAlbum, setCurrentTrack, setState } =
    usePlayer();
  const [showAlbumPanel, setShowAlbumPanel] = useState(false);
  const [showTrackPanel, setShowTrackPanel] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressInterval = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isPlayingRef = useRef(state.isPlaying);
  const previousTrackIdRef = useRef<string | null>(null);

  const activeAlbum = useMemo(() => {
    if (!library.length) {
      return undefined;
    }
    return library.find((album) => album.id === state.currentAlbumId) ?? library[0];
  }, [library, state.currentAlbumId]);

  const activeTrack = useMemo<PlayerTrack | undefined>(() => {
    if (!activeAlbum) {
      return undefined;
    }
    return (
      activeAlbum.tracks.find((track) => track.id === state.currentTrackId) ?? activeAlbum.tracks[0]
    );
  }, [activeAlbum, state.currentTrackId]);

  useEffect(() => {
    if (activeAlbum && state.currentAlbumId !== activeAlbum.id) {
      setCurrentAlbum(activeAlbum.id);
    }
  }, [activeAlbum, setCurrentAlbum, state.currentAlbumId]);

  useEffect(() => {
    if (activeTrack && state.currentTrackId !== activeTrack.id) {
      // Persist the resolved fallback track for future sessions.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentTrack(activeTrack.id);
    }
  }, [activeTrack, setCurrentTrack, state.currentTrackId]);

  useEffect(() => {
    // Persist hydration flag for client-only features (YouTube player + DOM APIs).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }
    if (state.isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [state.isPlaying]);
  useEffect(() => {
    isPlayingRef.current = state.isPlaying;
  }, [state.isPlaying]);

  useEffect(() => {
    if (!state.isPlaying || !playerRef.current) {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      return;
    }

    progressInterval.current = window.setInterval(() => {
      const player = playerRef.current;
      if (player) {
        try {
          const time = player.getCurrentTime();
          const dur = player.getDuration();
          if (time !== undefined && !Number.isNaN(time)) {
            setCurrentTime(time);
          }
          if (dur && !Number.isNaN(dur)) {
            setDuration((prev) => prev || dur);
          }
        } catch {
          // Player might not be ready yet, skip this update
        }
      }
    }, 1000);

    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [state.isPlaying]);

  useEffect(() => {
    const currentTrackId = activeTrack?.id;
    const videoId = activeTrack?.videoId;

    // Reset UI progress whenever a new track loads.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTime(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDuration(0);

    // Skip if no track or invalid video ID
    if (!currentTrackId || !videoId || typeof videoId !== "string" || videoId.trim() === "") {
      return;
    }

    // Only load video if this is a track change (not initial render)
    if (previousTrackIdRef.current === null) {
      // First render - let the YouTube component handle initial load
      previousTrackIdRef.current = currentTrackId;
      return;
    }

    // Track has changed - update the ref
    const isTrackChange = previousTrackIdRef.current !== currentTrackId;
    previousTrackIdRef.current = currentTrackId;

    if (!isTrackChange) {
      return;
    }

    const player = playerRef.current;
    if (!player) {
      return;
    }

    // Delay to ensure player iframe is ready
    const timeoutId = setTimeout(() => {
      try {
        const currentPlayer = playerRef.current;
        if (currentPlayer && typeof currentPlayer.loadVideoById === "function") {
          currentPlayer.loadVideoById(videoId);
          if (isPlayingRef.current) {
            currentPlayer.playVideo();
          }
        }
      } catch (error) {
        console.error("Error loading video:", error);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [activeTrack?.id, activeTrack?.videoId]);

  useEffect(() => {
    const handleCollapse = () => {
      setShowAlbumPanel(false);
      setShowTrackPanel(false);
      setState((prev) => (prev.isExpanded ? { ...prev, isExpanded: false } : prev));
    };

    window.addEventListener(MUSIC_PLAYER_COLLAPSE_EVENT, handleCollapse);
    return () => {
      window.removeEventListener(MUSIC_PLAYER_COLLAPSE_EVENT, handleCollapse);
    };
  }, [setShowAlbumPanel, setShowTrackPanel, setState]);

  useEffect(() => {
    if (!state.isExpanded) {
      return;
    }
    window.dispatchEvent(new Event(PET_PANEL_CLOSE_EVENT));
  }, [state.isExpanded]);

  if (!isHydrated || !library.length || !activeAlbum || !activeTrack) {
    return null;
  }

  const handleReady = (event: YouTubeEvent<YouTubePlayer>) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    if (isPlayingRef.current) {
      event.target.playVideo();
    }
  };

  const handleStateChange = (event: YouTubeEvent<YouTubePlayer>) => {
    if (event.data === 0) {
      // Video ended, play next track
      if (activeAlbum && activeTrack) {
        handleNextTrack(activeAlbum, activeTrack, setCurrentTrack);
      }
    }
    if (event.data === 1) {
      // Video is playing
      const duration = event.target.getDuration();
      if (duration && !Number.isNaN(duration)) {
        setDuration(duration);
      }
    }
  };

  const minimizedLabel = activeTrack.title;
  const formattedElapsed = formatTime(currentTime);
  const formattedTotal = formatTime(duration || activeTrack.durationSeconds);
  const progressPercent = duration ? Math.min((currentTime / duration) * 100, 100) : 0;
  const handleToggleExpanded = () => {
    setShowAlbumPanel(false);
    setShowTrackPanel(false);
    toggleExpanded();
  };

  return (
    <>
      {!state.isExpanded && (
        <div className="fixed bottom-28 right-6 z-40 w-[min(260px,80vw)]">
          <div className="flex items-center gap-3 rounded-full border border-white/20 bg-slate-950/70 px-3 py-2 text-white shadow-xl backdrop-blur">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={state.isPlaying ? t("pause") : t("play")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"
            >
              <span aria-hidden className="text-lg">
                {state.isPlaying ? "❚❚" : "▶"}
              </span>
              <span className="sr-only">{state.isPlaying ? t("pause") : t("play")}</span>
            </button>
            <p className="flex-1 truncate text-sm font-semibold">{minimizedLabel}</p>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg"
              onClick={handleToggleExpanded}
              aria-label={t("expand")}
            >
              <span aria-hidden>⌃</span>
            </button>
          </div>
        </div>
      )}
      {state.isExpanded && (
        <div className="fixed bottom-28 right-6 z-40 w-[min(360px,90vw)] text-sm text-white">
          <div className="rounded-[28px] border border-white/15 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-800/80 p-5 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.8)] backdrop-blur-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-200">
                  {activeAlbum.cover ? (
                    <Image
                      src={activeAlbum.cover}
                      alt={activeAlbum.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                      {t("noCover")}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{activeTrack.title}</h3>
                  {activeTrack.artist && (
                    <p className="text-xs text-white/70">{activeTrack.artist}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleExpanded}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white"
                aria-label={t("collapse")}
              >
                <span aria-hidden>˅</span>
              </button>
            </div>
            <div className="mt-4 space-y-2 text-xs text-white/70">
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-pink via-brand-400 to-accent-teal"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-white/60">
                <span>{formattedElapsed}</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-base text-white">
              <button
                type="button"
                onClick={() => handlePreviousTrack(activeAlbum, activeTrack, setCurrentTrack)}
                aria-label={t("previous")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30"
              >
                <span aria-hidden>⏮</span>
                <span className="sr-only">{t("previous")}</span>
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={state.isPlaying ? t("pause") : t("play")}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl"
              >
                <span aria-hidden>{state.isPlaying ? "❚❚" : "▶"}</span>
                <span className="sr-only">{state.isPlaying ? t("pause") : t("play")}</span>
              </button>
              <button
                type="button"
                onClick={() => handleNextTrack(activeAlbum, activeTrack, setCurrentTrack)}
                aria-label={t("next")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30"
              >
                <span aria-hidden>⏭</span>
                <span className="sr-only">{t("next")}</span>
              </button>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowAlbumPanel(true)}
                className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
              >
                {t("selectAlbum")}
              </button>
              <button
                type="button"
                onClick={() => setShowTrackPanel(true)}
                className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
              >
                {t("selectTrack")}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAlbumPanel && (
        <SelectorPanel
          title={t("albums")}
          items={library.map((album) => ({
            id: album.id,
            label: album.title,
            active: album.id === activeAlbum.id,
          }))}
          onClose={() => setShowAlbumPanel(false)}
          closeLabel={t("close")}
          onSelect={(id) => {
            setCurrentAlbum(id);
            setShowAlbumPanel(false);
          }}
        />
      )}
      {showTrackPanel && (
        <SelectorPanel
          title={t("tracks", { album: activeAlbum.title })}
          items={activeAlbum.tracks.map((track) => ({
            id: track.id,
            label: track.title,
            active: track.id === activeTrack.id,
          }))}
          onClose={() => setShowTrackPanel(false)}
          closeLabel={t("close")}
          onSelect={(id) => {
            setCurrentTrack(id);
            setShowTrackPanel(false);
          }}
        />
      )}
      <div className="hidden">
        <YouTube
          videoId={activeTrack.videoId}
          opts={{
            height: "0",
            width: "0",
            playerVars: { autoplay: state.isPlaying ? 1 : 0, controls: 0, rel: 0, playsinline: 1 },
          }}
          onReady={handleReady}
          onStateChange={handleStateChange}
        />
      </div>
    </>
  );
}

function SelectorPanel({ title, items, onClose, onSelect, closeLabel }: SelectorPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        aria-label={closeLabel}
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClose();
          }
        }}
      />
      <div className="relative flex h-full w-4/5 max-w-sm flex-col bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-900/85 p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between text-sm">
          <p className="font-semibold uppercase tracking-[0.3em] text-white/70">{title}</p>
          <button type="button" onClick={onClose} className="text-white/70 underline">
            {closeLabel}
          </button>
        </div>
        <div className="max-h-[70vh] space-y-2 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                item.active
                  ? "border-white/70 bg-white/10"
                  : "border-white/20 text-white/70 hover:border-white/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function handleNextTrack(
  album: PlayerAlbum,
  currentTrack: PlayerTrack,
  setCurrentTrack: (trackId: string) => void,
) {
  const index = album.tracks.findIndex((track) => track.id === currentTrack.id);
  if (index === -1) {
    setCurrentTrack(album.tracks[0].id);
    return;
  }
  const nextIndex = (index + 1) % album.tracks.length;
  setCurrentTrack(album.tracks[nextIndex].id);
}

function handlePreviousTrack(
  album: PlayerAlbum,
  currentTrack: PlayerTrack,
  setCurrentTrack: (trackId: string) => void,
) {
  const index = album.tracks.findIndex((track) => track.id === currentTrack.id);
  if (index === -1) {
    setCurrentTrack(album.tracks[0].id);
    return;
  }
  const prevIndex = (index - 1 + album.tracks.length) % album.tracks.length;
  setCurrentTrack(album.tracks[prevIndex].id);
}

function formatTime(seconds?: number): string {
  if (!seconds || Number.isNaN(seconds)) {
    return "00:00";
  }
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
