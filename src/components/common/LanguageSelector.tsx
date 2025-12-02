"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent } from "react";
import { useEffect } from "react";

import { locales, type AppLocale } from "@/i18n";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

const LOCALE_NAMES: Record<AppLocale, string> = {
  zh: "繁體中文",
  ko: "한국어",
  ja: "日本語",
  en: "English",
};

export default function LanguageSelector() {
  const activeLocale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [storedLocale, setStoredLocale] = useLocalStorage<AppLocale>("knk-language", activeLocale);

  useEffect(() => {
    if (storedLocale !== activeLocale) {
      setStoredLocale(activeLocale);
    }
  }, [activeLocale, setStoredLocale, storedLocale]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as AppLocale;
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

    router.replace(newPath);
    router.refresh();
  };

  return (
    <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
      <span>{t("language.label")}</span>
      <span className="relative">
        <select
          aria-label={t("language.label")}
          className="appearance-none rounded-full border border-white/15 bg-surface-muted/80 px-4 py-2 pr-8 text-sm text-white backdrop-blur focus:border-brand-400"
          value={activeLocale}
          onChange={handleChange}
        >
          {locales.map((locale) => (
            <option className="bg-surface-muted" key={locale} value={locale}>
              {LOCALE_NAMES[locale] ?? locale.toUpperCase()}
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
