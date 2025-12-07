import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import VarietyCard from "@/components/variety/VarietyCard";
import type { AppLocale } from "@/i18n";
import { fetchVarietyCards } from "@/lib/notion/variety";

export const revalidate = 86400; // 24 小時

interface VarietyPageParams {
  params: Promise<{ locale: AppLocale }>;
}

export async function generateMetadata({ params }: VarietyPageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t("variety.hero.heading"),
    description: t("variety.hero.subheading"),
    openGraph: {
      title: t("variety.hero.heading"),
      description: t("variety.hero.subheading"),
    },
  };
}

export default async function VarietyPage({ params }: VarietyPageParams) {
  const { locale } = await params;
  const [t, varietyCards] = await Promise.all([getTranslations({ locale }), fetchVarietyCards(locale)]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white">
      <header className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-teal">{t("variety.title")}</p>
        <h1 className="text-4xl font-bold md:text-5xl">{t("variety.hero.heading")}</h1>
        <p className="text-base text-text-secondary">{t("variety.hero.subheading")}</p>
      </header>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {varietyCards.map((card) => (
          <VarietyCard item={card} key={card.id} />
        ))}
      </div>
    </div>
  );
}
