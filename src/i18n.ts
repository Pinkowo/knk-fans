import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

export const locales = ["zh", "ko", "ja", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "zh";
export const localePrefix = "always" as const;

async function loadMessages(locale: AppLocale) {
  switch (locale) {
    case "zh":
      return (await import("./messages/zh.json")).default;
    case "ko":
      return (await import("./messages/ko.json")).default;
    case "ja":
      return (await import("./messages/ja.json")).default;
    case "en":
      return (await import("./messages/en.json")).default;
    default:
      notFound();
      return {};
  }
}

export default getRequestConfig(async ({ locale }) => {
  const normalizedLocale = locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : defaultLocale;

  return {
    locale: normalizedLocale,
    messages: await loadMessages(normalizedLocale),
  };
});
