"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent } from "react";
import { useEffect, useTransition } from "react";

import { locales, type AppLocale } from "@/i18n";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { LOCALE_LABELS } from "@/lib/constants/locales";
import { useLoadingState } from "@/lib/context/LoadingContext";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

export default function LanguageSelector() {
  const activeLocale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [storedLocale, setStoredLocale] = useLocalStorage<AppLocale>("knk-language", activeLocale);
  const { beginLoading, endLoading, state } = useLoadingState();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (storedLocale !== activeLocale) {
      setStoredLocale(activeLocale);
    }
  }, [activeLocale, setStoredLocale, storedLocale]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as AppLocale;
    if (nextLocale === activeLocale) {
      return;
    }

    if (state.isLoading && state.targetLocale === nextLocale) {
      return;
    }

    setStoredLocale(nextLocale);

    const newPath = (() => {
      if (!pathname) {
        return `/${nextLocale}`;
      }

      const segments = pathname.split("/").filter(Boolean);
      if (segments.length === 0) {
        return `/${nextLocale}`;
      }

      segments[0] = nextLocale;
      return `/${segments.join("/")}`;
    })();

    beginLoading(nextLocale);
    trackEvent({
      eventName: ANALYTICS_EVENTS.language_switch,
      eventType: "navigation",
      pageLocation: pathname ?? window.location.pathname,
      locale: activeLocale,
      properties: {
        targetLocale: nextLocale,
      },
    });
    startTransition(() => {
      router.replace(newPath);
      router.refresh();
    });
  };

  useEffect(() => {
    if (!isPending) {
      endLoading();
    }
  }, [endLoading, isPending]);

  return (
    <label className="inline-flex items-center gap-2 text-sm text-text-secondary" aria-live="polite">
      <span>{t("language.label")}</span>
      <span className="relative">
        <select
          aria-label={t("language.label")}
          aria-busy={isPending}
          className="appearance-none rounded-full border border-white/15 bg-surface-muted/80 px-4 py-2 pr-8 text-sm text-white backdrop-blur focus:border-brand-400"
          data-loading={state.isLoading}
          disabled={isPending}
          value={activeLocale}
          onChange={handleChange}
        >
          {locales.map((locale) => (
            <option className="bg-surface-muted" key={locale} value={locale}>
              {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-text-secondary">
          ▾
        </span>
      </span>
    </label>
  );
}
