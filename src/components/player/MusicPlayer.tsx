"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import YouTubeEmbed from "@/components/music/YouTubeEmbed";
import { usePlayer } from "@/lib/context/PlayerContext";

const CHANNEL_PLAYLIST_ID = "UUWfJjnpqSIWpKJ-ntZ2GShA";

export default function MusicPlayer() {
  const t = useTranslations();
  const { state, togglePlay, toggleVisible } = usePlayer();
  const currentTrack = state.queue[state.currentIndex];
  const youtubeId = useMemo(() => currentTrack?.videoId, [currentTrack]);
  const panelId = "music-player-panel";
  const headingId = "music-player-heading";

  if (!state.isOpen) {
    return (
      <button
        type="button"
        onClick={toggleVisible}
        className="fixed bottom-5 right-5 z-50 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-sm text-white backdrop-blur md:bottom-6 md:right-6"
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-expanded={false}
      >
        {t("player.open")}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby={headingId}
      className="fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-full rounded-3xl border border-white/10 bg-black/80 p-4 text-white backdrop-blur md:bottom-4 md:left-4 md:right-4 md:max-w-3xl md:p-5"
      id={panelId}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-yellow">{t("player.nowPlaying")}</p>
          <h3 className="text-xl font-semibold" id={headingId}>
            {currentTrack?.title ?? t("player.channelPlaylist")}
          </h3>
          {currentTrack?.artist && <p className="text-sm text-text-secondary">{currentTrack.artist}</p>}
          {!youtubeId && (
            <p className="text-sm text-text-secondary">{t("player.channelPlaylistDescription")}</p>
          )}
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
      <div className="mt-4">
        {youtubeId ? (
          <YouTubeEmbed videoId={youtubeId} title={currentTrack?.title ?? t("player.nowPlaying")} />
        ) : (
          <YouTubeEmbed playlistId={CHANNEL_PLAYLIST_ID} title={t("player.channelPlaylist")} />
        )}
      </div>
    </div>
  );
}
