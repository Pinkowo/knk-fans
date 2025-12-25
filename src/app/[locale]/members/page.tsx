import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import MembersGrid from "@/components/members/MembersGrid";
import type { AppLocale } from "@/i18n";
import { fetchMembers } from "@/lib/notion/members";
import { buildAlternates, buildPageUrl } from "@/lib/seo/metadata";

export const revalidate = 3600; // 1 小時重新驗證

interface MembersPageParams {
  params: Promise<{ locale: AppLocale }>;
}

export async function generateMetadata({ params }: MembersPageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = "/members";

  return {
    title: t("members.hero.heading"),
    description: t("members.hero.subheading"),
    alternates: buildAlternates(locale, path),
    openGraph: {
      title: t("members.hero.heading"),
      description: t("members.hero.subheading"),
      url: buildPageUrl(locale, path),
    },
  };
}

export default async function MembersPage({ params }: MembersPageParams) {
  const { locale } = await params;
  const [t, members] = await Promise.all([getTranslations({ locale }), fetchMembers(locale)]);

  const current = members.filter((member) => member.status === "current");
  const former = members.filter((member) => member.status === "former");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white">
      <header className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-teal">{t("members.title")}</p>
        <h1 className="text-4xl font-bold text-white md:text-5xl">{t("members.hero.heading")}</h1>
        <p className="text-base text-text-secondary">{t("members.hero.subheading")}</p>
      </header>
      <div className="mt-10">
        <MembersGrid current={current} former={former} locale={locale} />
      </div>
    </div>
  );
}
