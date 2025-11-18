"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import YouTubeEmbed from "@/components/music/YouTubeEmbed";
import { usePlayer } from "@/lib/context/PlayerContext";

export default function MusicPlayer() {
  const t = useTranslations();
  const { state, togglePlay, toggleVisible } = usePlayer();
  const currentTrack = state.queue[state.currentIndex];
  const youtubeId = useMemo(() => currentTrack?.videoId, [currentTrack]);

  if (!state.isOpen) {
    return (
      <button
        type="button"
        onClick={toggleVisible}
        className="fixed bottom-6 left-6 z-50 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-sm text-white backdrop-blur"
      >
        {t("player.open")}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-3xl border border-white/10 bg-black/80 p-4 text-white backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-yellow">{t("player.nowPlaying")}</p>
          <h3 className="text-xl font-semibold">{currentTrack?.title ?? t("player.queueEmpty")}</h3>
          {currentTrack?.artist && <p className="text-sm text-text-secondary">{currentTrack.artist}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="rounded-full border border-white/20 px-3 py-1 text-sm"
          >
            {state.isPlaying ? t("player.pause") : t("player.play")}
          </button>
          <button
            type="button"
            onClick={toggleVisible}
            className="rounded-full border border-white/20 px-3 py-1 text-sm"
          >
            {t("player.collapse")}
          </button>
        </div>
      </div>
      {youtubeId ? (
        <div className="mt-4">
          <YouTubeEmbed videoId={youtubeId} title={currentTrack?.title ?? "track"} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-secondary">{t("player.noVideo")}</p>
      )}
    </div>
  );
}
