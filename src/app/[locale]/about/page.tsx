import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { AppLocale } from "@/i18n";
import { fetchGroupInfo } from "@/lib/notion/about";

export const revalidate = 604800;

interface AboutPageParams {
  params: Promise<{ locale: AppLocale }>;
}

export async function generateMetadata({ params }: AboutPageParams): Promise<Metadata> {
  const { locale } = await params;
  const group = await fetchGroupInfo(locale);

  return {
    title: group.name,
    description: group.description,
    openGraph: {
      title: group.name,
      description: group.description,
    },
  };
}

export default async function AboutPage({ params }: AboutPageParams) {
  const { locale } = await params;
  const [t, group] = await Promise.all([getTranslations({ locale }), fetchGroupInfo(locale)]);
  const visitLabel = t("about.links.visit");
  const fandomName = t("about.fandomName");
  const officialLinks = [
    {
      id: "officialYoutube",
      url: "https://www.youtube.com/@knk5601",
      platform: "YOUTUBE",
    },
    {
      id: "varietyChannel",
      url: "https://www.youtube.com/@%EB%8B%A4%ED%81%B0%EB%86%88%EB%93%A4",
      platform: "YOUTUBE",
    },
    {
      id: "instagram",
      url: "https://www.instagram.com/knk_official_knk",
      platform: "INSTAGRAM",
    },
  ].map((link) => ({
    ...link,
    label: t(`about.links.items.${link.id}.label`),
    description: t(`about.links.items.${link.id}.description`),
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-12 text-white">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-teal">{t("about.title")}</p>
        <h1 className="text-4xl font-bold md:text-5xl">{group.name}</h1>
        <p className="text-base text-text-secondary">{group.description}</p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-text-secondary">
              {t("about.debut")}
            </p>
            <p className="text-2xl font-semibold">{group.debutDate}</p>
          </div>
          {group.membersCount && (
            <p className="text-sm text-text-secondary">
              {t("about.members", { count: group.membersCount })}
            </p>
          )}
          <div className="space-y-1 pt-2">
            <p className="text-xs uppercase tracking-[0.3em] text-text-secondary">
              {t("about.fandom")}
            </p>
            <p className="text-2xl font-semibold text-white">{fandomName}</p>
          </div>
        </div>
        <div className="relative h-80 w-full overflow-hidden rounded-3xl">
          <Image
            src={
              group.cover ||
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
            }
            alt={t("about.coverImageAlt", { name: group.name })}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>
      </section>
      {group.achievements && (
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">{t("about.achievements")}</h2>
          <ul className="space-y-3 text-sm text-text-secondary">
            {group.achievements.map((item) => (
              <li key={`${item.title}-${item.description}`} className="flex flex-wrap items-baseline gap-2">
                <span className="font-semibold text-white">{item.title}</span>
                <span className="text-white/40">|</span>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-accent-yellow">
            {t("about.links.title")}
          </p>
          <p className="text-sm text-text-secondary">{t("about.links.description")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {officialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/30"
            >
              <div className="flex-1 space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-accent-teal">
                  {link.platform}
                </p>
                <h3 className="text-lg font-semibold text-white">{link.label}</h3>
                <p className="text-sm text-text-secondary">{link.description}</p>
              </div>
              <div className="mt-auto flex" style={{ justifyContent: "flex-end" }}>
                <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-accent-yellow">
                  {visitLabel}
                  <span aria-hidden="true">↗</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
