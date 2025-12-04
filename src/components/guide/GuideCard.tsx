"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { MouseEvent } from "react";

import type { GuideCategory, GuideContentResolvedItem } from "@/types/ui-ux";

interface GuideCardProps {
  item: GuideContentResolvedItem;
  category: GuideCategory;
  allowExpand: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMyMjIyMzAnIC8+PC9zdmc+";

export default function GuideCard({ item, category, allowExpand, isExpanded, onToggle }: GuideCardProps) {
  const t = useTranslations("guide.sections");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onToggle?.();
  };

  const content = (
    <>
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
      {allowExpand && (
        <span className="inline-flex items-center text-sm font-semibold text-accent-pink">
          {isExpanded ? t("collapseCta") : t("expandCta")}
          <span className="ml-2 transition-transform" aria-hidden>
            {isExpanded ? "−" : "+"}
          </span>
        </span>
      )}
    </>
  );

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className={`card-surface flex h-full flex-col p-4 ${allowExpand && isExpanded ? "border-white/30" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {allowExpand ? (
        <button
          aria-expanded={isExpanded}
          className="flex w-full flex-col gap-4 text-left cursor-pointer"
          onClick={handleClick}
          type="button"
        >
          {content}
        </button>
      ) : (
        <div className="flex w-full flex-col gap-4 text-left">{content}</div>
      )}
    </motion.article>
  );
}
