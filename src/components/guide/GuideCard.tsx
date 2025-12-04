"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

import type { AppLocale } from "@/i18n";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import type { GuideCategory, GuideContentResolvedItem } from "@/types/ui-ux";

import YouTubeEmbed from "./YouTubeEmbed";

interface GuideCardProps {
  item: GuideContentResolvedItem;
  category: GuideCategory;
}

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMyMjIyMzAnIC8+PC9zdmc+";

export default function GuideCard({ item, category }: GuideCardProps) {
  const t = useTranslations("guide.sections");
  const embedLabel = useTranslations("guide.embed");
  const locale = useLocale() as AppLocale;
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();

  const toggle = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next) {
        trackEvent({
          eventName: ANALYTICS_EVENTS.guide_card_expand,
          eventType: "interaction",
          pageLocation: window.location.pathname,
          locale,
          properties: {
            cardId: item.id,
            category,
          },
        });
      }
      return next;
    });
  };

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="card-surface flex h-full flex-col p-4"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <button
        aria-controls={contentId}
        aria-expanded={isExpanded}
        className="flex w-full flex-col gap-4 text-left"
        onClick={toggle}
        type="button"
      >
        <div className="relative h-48 w-full overflow-hidden rounded-2xl">
          <Image
            alt={t("thumbnailAlt", { title: item.title })}
            className="object-cover"
            fill
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(min-width: 768px) 50vw, 100vw"
            src={item.thumbnail}
          />
          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
            {t(`badges.${category}`)}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{item.title}</h3>
          {item.description && <p className="text-sm text-text-secondary">{item.description}</p>}
        </div>
        <span className="inline-flex items-center text-sm font-semibold text-accent-pink">
          {isExpanded ? t("collapseCta") : t("expandCta")}
          <span className="ml-2 transition-transform" aria-hidden>
            {isExpanded ? "−" : "+"}
          </span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            className="overflow-hidden rounded-2xl border border-white/5 bg-black/30 p-3"
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            id={contentId}
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
          >
            <YouTubeEmbed key={item.videoId} title={item.title} videoId={item.videoId} />
            <p className="sr-only">{embedLabel("ariaLabel", { title: item.title })}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
