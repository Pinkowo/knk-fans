"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import YouTubeEmbed from "@/components/music/YouTubeEmbed";
import type { VarietySeries } from "@/types/variety";

interface SeriesCardProps {
  series: VarietySeries;
  priority?: boolean;
  isOpen?: boolean;
  onToggle?: (seriesId: string) => void;
}

export default function SeriesCard({ series, priority = false, isOpen, onToggle }: SeriesCardProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = typeof isOpen === "boolean" ? isOpen : internalOpen;
  const t = useTranslations();
  const headingId = `series-heading-${series.id}`;
  const panelId = `series-panel-${series.id}`;

  const handleToggle = () => {
    if (onToggle) {
      onToggle(series.id);
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center gap-4 p-4 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={headingId}
      >
        <div className="relative h-16 w-24 overflow-hidden rounded-2xl">
          <Image
            src={
              series.cover ||
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
            }
            alt={series.name}
            fill
            className="object-cover"
            sizes="150px"
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMxNjIyMzMnIC8+PC9zdmc+"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.3em] text-accent-teal">{t("variety.seriesLabel")}</p>
          <h3 className="text-xl font-semibold text-white" id={headingId}>
            {series.name}
          </h3>
          {series.description && <p className="text-sm text-text-secondary">{series.description}</p>}
        </div>
        <span className="text-sm text-text-secondary">{open ? "−" : "+"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-6 border-t border-white/10 p-6"
            role="region"
            aria-labelledby={headingId}
          >
            {series.episodes.map((episode) => (
              <div key={episode.id} className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                    {episode.episodeNumber ? `${t("variety.episode")} ${episode.episodeNumber}` : t("variety.special")}
                  </p>
                  <h4 className="text-lg font-semibold text-white">{episode.title}</h4>
                  {episode.description && <p className="text-sm text-text-secondary">{episode.description}</p>}
                </div>
                {episode.videoId && (
                  <YouTubeEmbed videoId={episode.videoId} title={episode.title} />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
