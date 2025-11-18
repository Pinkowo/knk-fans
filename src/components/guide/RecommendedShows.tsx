"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { fadeInUp, staggerContainer } from "@/lib/animation/variants";
import type { RecommendedItem } from "@/types/guide";

interface RecommendedShowsProps {
  items: RecommendedItem[];
}

export default function RecommendedShows({ items }: RecommendedShowsProps) {
  const t = useTranslations();

  return (
    <section className="mx-auto mt-12 max-w-6xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent-teal">
            {t("guide.sections.stages")}
          </p>
          <h2 className="text-3xl font-bold text-white">Stages & Variety Picks</h2>
        </div>
      </div>
      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1)}
      >
        {items.map((item) => (
          <motion.article className="glass-panel h-full p-6" key={item.id} variants={fadeInUp}>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span className="rounded-full bg-accent-teal/20 px-3 py-1 text-xs uppercase tracking-wide text-accent-teal" key={`${item.id}-${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>
              {item.link && (
                <a
                  className="inline-flex items-center text-sm font-semibold text-accent-teal transition hover:text-white"
                  href={item.link}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("actions.viewMore")}
                  <span className="ml-2">↗</span>
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
