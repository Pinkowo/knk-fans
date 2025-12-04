"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { AppLocale } from "@/i18n";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import type { VarietyCardItem } from "@/types/ui-ux";

interface VarietyCardProps {
  item: VarietyCardItem;
}

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMwNDA0MDQnIC8+PC9zdmc+";

export default function VarietyCard({ item }: VarietyCardProps) {
  const t = useTranslations("variety");
  const locale = useLocale() as AppLocale;

  const handleClick = () => {
    trackEvent({
      eventName: ANALYTICS_EVENTS.variety_card_click,
      eventType: "interaction",
      pageLocation: window.location.pathname,
      locale,
      properties: {
        cardId: item.id,
        url: item.externalUrl,
      },
    });
  };

  return (
    <article className="card-surface flex h-full flex-col overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          alt={`${item.title} thumbnail`}
          className="object-cover"
          fill
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          src={item.thumbnail}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-text-secondary"
                key={`${item.id}-${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
        {item.description && <p className="text-sm text-text-secondary">{item.description}</p>}
        <a
          aria-label={t("newTabAria", { title: item.title })}
          className="mt-auto inline-flex items-center text-sm font-semibold text-accent-teal transition hover:text-white"
          href={item.externalUrl}
          rel="noreferrer"
          target="_blank"
          onClick={handleClick}
        >
          {t("cta")}
          <span className="ml-2 text-xs uppercase tracking-[0.3em] text-text-secondary">{t("openNewTab")}</span>
        </a>
      </div>
    </article>
  );
}
