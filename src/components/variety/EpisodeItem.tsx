"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import YouTubeEmbed from "@/components/music/YouTubeEmbed";
import type { Episode } from "@/types/variety";

interface EpisodeItemProps {
  episode: Episode;
}

export default function EpisodeItem({ episode }: EpisodeItemProps) {
  const [open, setOpen] = useState(false);
  const headingId = `episode-heading-${episode.id}`;
  const panelId = `episode-panel-${episode.id}`;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={headingId}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">EP {episode.episodeNumber}</p>
          <h4 className="text-lg font-semibold text-white" id={headingId}>
            {episode.title}
          </h4>
        </div>
        <span className="text-sm text-text-secondary">{open ? "−" : "+"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && episode.videoId && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 p-4"
            role="region"
            aria-labelledby={headingId}
          >
            <YouTubeEmbed videoId={episode.videoId} title={episode.title} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
