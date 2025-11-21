import { getTranslations } from "next-intl/server";

import SeriesList from "@/components/variety/SeriesList";
import type { AppLocale } from "@/i18n";
import { fetchVarietySeries } from "@/lib/notion/variety";

export const revalidate = 86400; // 24 小時

interface VarietyPageParams {
  params: Promise<{ locale: AppLocale }>;
}

export default async function VarietyPage({ params }: VarietyPageParams) {
  const { locale } = await params;
  const [t, seriesList] = await Promise.all([getTranslations({ locale }), fetchVarietySeries(locale)]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white">
      <header className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-teal">{t("variety.title")}</p>
        <h1 className="text-4xl font-bold md:text-5xl">{t("variety.hero.heading")}</h1>
        <p className="text-base text-text-secondary">{t("variety.hero.subheading")}</p>
      </header>
      <SeriesList series={seriesList} />
    </div>
  );
}
