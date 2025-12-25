import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import GuideSection from "@/components/guide/GuideSection";
import type { AppLocale } from "@/i18n";
import { buildAlternates, buildPageUrl } from "@/lib/seo/metadata";
import { getGuideContentSections } from "@/lib/notion/guide";
import type { GuideCategory } from "@/types/ui-ux";

interface GuidePageParams {
  params: Promise<{ locale: AppLocale }>;
}

export async function generateMetadata({ params }: GuidePageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const title = t("guide.hero.title");
  const description = t("guide.hero.subtitle");
  const path = "";

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title,
      description,
      url: buildPageUrl(locale, path),
    },
  };
}

export default async function GuidePage({ params }: GuidePageParams) {
  const { locale } = await params;
  const [t, sections] = await Promise.all([getTranslations({ locale }), getGuideContentSections(locale)]);

  const sectionMeta: Array<{
    category: GuideCategory;
    eyebrowKey: string;
    titleKey: string;
    descriptionKey: string;
    allowExpand: boolean;
  }> = [
    { category: "why-knk", eyebrowKey: "whyEyebrow", titleKey: "whyTitle", descriptionKey: "whyDescription", allowExpand: false },
    { category: "stage", eyebrowKey: "stageEyebrow", titleKey: "stageTitle", descriptionKey: "stageDescription", allowExpand: true },
    { category: "song", eyebrowKey: "songEyebrow", titleKey: "songTitle", descriptionKey: "songDescription", allowExpand: true },
    { category: "variety", eyebrowKey: "varietyEyebrow", titleKey: "varietyTitle", descriptionKey: "varietyDescription", allowExpand: true },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white">
      <header className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-pink">
          {t("nav.home")}
        </p>
        <h1 className="text-4xl font-bold md:text-5xl">
          {t("guide.hero.title")}
        </h1>
        <p className="text-base text-text-secondary">
          {t("guide.hero.subtitle")}
        </p>
      </header>
      <div className="mt-10 flex flex-col gap-16">
        {sectionMeta.map((meta) => {
          const items = sections[meta.category];
          if (!items || items.length === 0) {
            return null;
          }

          return (
            <GuideSection
              allowExpand={meta.allowExpand}
              category={meta.category}
              description={t(`guide.sections.${meta.descriptionKey}`)}
              eyebrow={t(`guide.sections.${meta.eyebrowKey}`)}
              items={items}
              key={meta.category}
              title={t(`guide.sections.${meta.titleKey}`)}
            />
          );
        })}
      </div>
    </div>
  );
}
