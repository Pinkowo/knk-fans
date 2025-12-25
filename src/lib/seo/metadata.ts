import { defaultLocale, locales, type AppLocale } from "@/i18n";

const LOCALE_TO_HREFLANG: Record<AppLocale, string> = {
  zh: "zh-TW",
  ko: "ko-KR",
  ja: "ja-JP",
  en: "en-US",
};

function normalizePath(path: string): string {
  if (!path || path === "/") {
    return "";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.knk-fans.com";
}

export function buildPageUrl(locale: AppLocale, path: string): string {
  const normalized = normalizePath(path);
  return `${getSiteUrl()}/${locale}${normalized}`;
}

export function buildAlternates(locale: AppLocale, path: string) {
  const normalized = normalizePath(path);
  const languages: Record<string, string> = {};

  locales.forEach((candidate) => {
    languages[LOCALE_TO_HREFLANG[candidate]] = `/${candidate}${normalized}`;
  });

  languages["x-default"] = `/${defaultLocale}${normalized}`;

  return {
    canonical: `/${locale}${normalized}`,
    languages,
  };
}
