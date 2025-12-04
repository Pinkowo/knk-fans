import { getTranslations } from "next-intl/server";

import GuideCard from "@/components/guide/GuideCard";
import type { AppLocale } from "@/i18n";
import { getGuideContentSections } from "@/lib/notion/guide";
import type { GuideCategory } from "@/types/ui-ux";

interface GuidePageParams {
  params: Promise<{ locale: AppLocale }>;
}

export default async function GuidePage({ params }: GuidePageParams) {
  const { locale } = await params;
  const [t, sections] = await Promise.all([getTranslations({ locale }), getGuideContentSections(locale)]);

  const sectionMeta: Array<{
    category: GuideCategory;
    eyebrowKey: string;
    titleKey: string;
    descriptionKey: string;
  }> = [
    { category: "why-knk", eyebrowKey: "whyEyebrow", titleKey: "whyTitle", descriptionKey: "whyDescription" },
    { category: "stage", eyebrowKey: "stageEyebrow", titleKey: "stageTitle", descriptionKey: "stageDescription" },
    { category: "song", eyebrowKey: "songEyebrow", titleKey: "songTitle", descriptionKey: "songDescription" },
    { category: "variety", eyebrowKey: "varietyEyebrow", titleKey: "varietyTitle", descriptionKey: "varietyDescription" },
  ];

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-6xl px-6 pt-12 text-center md:text-left">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-pink">
          {t("nav.home")}
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
          {t("guide.hero.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          {t("guide.hero.subtitle")}
        </p>
      </section>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-16 px-6">
        {sectionMeta.map((meta) => {
          const items = sections[meta.category];
          if (!items || items.length === 0) {
            return null;
          }

          const headingId = `${meta.category}-heading`;
          return (
            <section aria-labelledby={headingId} key={meta.category}>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-accent-pink">
                  {t(`guide.sections.${meta.eyebrowKey}`)}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white" id={headingId}>
                  {t(`guide.sections.${meta.titleKey}`)}
                </h2>
                <p className="mt-2 max-w-3xl text-base text-text-secondary">
                  {t(`guide.sections.${meta.descriptionKey}`)}
                </p>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {items.map((item) => (
                  <GuideCard category={meta.category} item={item} key={item.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
