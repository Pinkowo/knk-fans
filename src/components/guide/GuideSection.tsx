"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

import type { AppLocale } from "@/i18n";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import type { GuideCategory, GuideContentResolvedItem } from "@/types/ui-ux";

import GuideCard from "./GuideCard";
import YouTubeEmbed from "./YouTubeEmbed";

interface GuideSectionProps {
  category: GuideCategory;
  eyebrow: string;
  title: string;
  description: string;
  items: GuideContentResolvedItem[];
  allowExpand: boolean;
}

export default function GuideSection({
  category,
  eyebrow,
  title,
  description,
  items,
  allowExpand,
}: GuideSectionProps) {
  const locale = useLocale() as AppLocale;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const expandedItem = useMemo(
    () => items.find((item) => item.id === expandedId),
    [items, expandedId],
  );

  const handleToggle = (id: string) => {
    if (!allowExpand) {
      return;
    }
    setExpandedId((previous) => {
      const next = previous === id ? null : id;
      if (next) {
        trackEvent({
          eventName: ANALYTICS_EVENTS.guide_card_expand,
          eventType: "interaction",
          pageLocation: window.location.pathname,
          locale,
          properties: {
            cardId: id,
            category,
          },
        });
      }
      return next;
    });
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-accent-pink">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-white">{title}</h2>
        <p className="mt-2 max-w-3xl text-base text-text-secondary">{description}</p>
      </div>
      <div className={`grid gap-6 ${allowExpand ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {items.map((item) => (
          <GuideCard
            key={item.id}
            allowExpand={allowExpand}
            category={category}
            item={item}
            isExpanded={expandedId === item.id}
            onToggle={() => handleToggle(item.id)}
          />
        ))}
      </div>
      {allowExpand && (
        <AnimatePresence>
          {expandedItem && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
              exit={{ opacity: 0, y: 20 }}
              initial={{ opacity: 0, y: 20 }}
            >
              <div className="card-surface bg-black/60 p-4 md:p-6">
                <div className="overflow-hidden rounded-2xl">
                  <YouTubeEmbed key={expandedItem.videoId} title={expandedItem.title} videoId={expandedItem.videoId} />
                </div>
                {expandedItem.description && (
                  <p className="mt-4 text-sm text-text-secondary">{expandedItem.description}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
