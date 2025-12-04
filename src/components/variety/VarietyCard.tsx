"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { AppLocale } from "@/i18n";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import type { VarietyCardItem } from "@/types/ui-ux";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyMwNDA0MDQnIC8+PC9zdmc+";

interface VarietyCardProps {
  item: VarietyCardItem;
}

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
    <a
      aria-label={t("ariaLabel", { title: item.title })}
      className="card-surface flex h-full flex-col overflow-hidden border border-white/5 transition hover:-translate-y-1 hover:border-white/30 cursor-pointer"
      href={item.externalUrl}
      rel="noreferrer"
      target="_blank"
      onClick={handleClick}
    >
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
        <div className="mt-auto text-sm font-semibold text-accent-pink">{t("cta")}</div>
      </div>
    </a>
  );
}
