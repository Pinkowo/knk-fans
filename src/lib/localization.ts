import { defaultLocale, type AppLocale } from "@/i18n";

function fallbackValue<T>(value: Partial<Record<AppLocale, T>>): T | undefined {
  for (const localeValue of Object.values(value)) {
    if (localeValue !== undefined) {
      return localeValue;
    }
  }
  return undefined;
}

export function getLocalizedValue<T>(value: Partial<Record<AppLocale, T>>, locale: AppLocale): T {
  return value[locale] ?? value[defaultLocale] ?? (fallbackValue(value) as T);
}

export function getLocalizedList<T>(value: Partial<Record<AppLocale, T[]>>, locale: AppLocale): T[] {
  return value[locale] ?? value[defaultLocale] ?? fallbackValue(value) ?? [];
}
