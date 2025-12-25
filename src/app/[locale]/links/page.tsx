import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import LinkCard from "@/components/links/LinkCard";
import type { AppLocale } from "@/i18n";
import { fetchExternalLinks } from "@/lib/notion/links";
import { buildAlternates, buildPageUrl } from "@/lib/seo/metadata";

export const revalidate = 604800;

interface PageParams {
  params: Promise<{ locale: AppLocale }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = "/links";

  return {
    title: t("links.heading"),
    description: t("links.subheading"),
    alternates: buildAlternates(locale, path),
    openGraph: {
      title: t("links.heading"),
      description: t("links.subheading"),
      url: buildPageUrl(locale, path),
    },
  };
}

export default async function LinksPage({ params }: PageParams) {
  const { locale } = await params;
  const [t, links] = await Promise.all([getTranslations({ locale }), fetchExternalLinks(locale)]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12 text-white">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-pink">{t("links.title")}</p>
        <h1 className="text-4xl font-bold md:text-5xl">{t("links.heading")}</h1>
        <p className="text-base text-text-secondary">{t("links.subheading")}</p>
      </header>
      <div className="space-y-4">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </div>
  );
}
