"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { fadeInUp, staggerContainer } from "@/lib/animation/variants";
import type { RecommendedItem } from "@/types/guide";

interface RecommendedSongsProps {
  items: RecommendedItem[];
}

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMyMjIyMzAnIC8+PC9zdmc+";

export default function RecommendedSongs({ items }: RecommendedSongsProps) {
  const t = useTranslations();

  return (
    <section className="mx-auto mt-10 max-w-6xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent-pink">
            {t("guide.sections.songs")}
          </p>
          <h2 className="text-3xl font-bold text-white">Playlist Starter</h2>
        </div>
      </div>
      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.15)}
      >
        {items.map((item, index) => (
          <motion.article className="glass-panel h-full overflow-hidden p-6" key={item.id} variants={fadeInUp}>
            <div className="flex flex-col gap-4">
              {item.thumbnail && (
                <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={item.thumbnail}
                    alt={`${item.title} artwork`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 45vw, 100vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    priority={index < 2}
                  />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    className="rounded-full bg-brand-500/15 px-3 py-1 text-xs uppercase tracking-wide text-brand-200"
                    key={`${item.id}-${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {item.link && (
                <a
                  className="inline-flex items-center text-sm font-semibold text-accent-pink transition hover:text-white"
                  href={item.link}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("actions.listenNow")}
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
