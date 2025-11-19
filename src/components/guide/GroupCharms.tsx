"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useId } from "react";

import { fadeIn, staggerContainer } from "@/lib/animation/variants";
import type { GroupCharm } from "@/types/guide";

interface GroupCharmsProps {
  charms: GroupCharm[];
}

export default function GroupCharms({ charms }: GroupCharmsProps) {
  const t = useTranslations();
  const headingId = useId();

  return (
    <section className="mx-auto mt-14 max-w-6xl" aria-labelledby={headingId}>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent-yellow">
            {t("guide.sections.charms")}
          </p>
          <h2 className="text-3xl font-bold text-white" id={headingId}>
            Why KNK?
          </h2>
        </div>
      </div>
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.08)}
      >
        {charms.map((charm) => (
          <motion.article className="glass-panel p-6 text-center" key={charm.id} variants={fadeIn}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl">
              {charm.icon ?? "✨"}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">{charm.title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{charm.description}</p>
            <span className="mt-4 inline-block text-xs uppercase tracking-widest text-accent-yellow">
              {charm.category}
            </span>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
