import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { AppLocale } from "@/i18n";
import { fetchGroupInfo } from "@/lib/notion/about";

export const revalidate = 604800;

interface AboutPageParams {
  params: Promise<{ locale: AppLocale }>;
}

export default async function AboutPage({ params }: AboutPageParams) {
  const { locale } = await params;
  const [t, group] = await Promise.all([getTranslations({ locale }), fetchGroupInfo(locale)]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-12 text-white">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-teal">{t("about.title")}</p>
        <h1 className="text-4xl font-bold md:text-5xl">{group.name}</h1>
        <p className="text-base text-text-secondary">{group.description}</p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-text-secondary">{t("about.debut")}</p>
          <p className="text-2xl font-semibold">{group.debutDate}</p>
          {group.membersCount && (
            <p className="text-sm text-text-secondary">{t("about.members", { count: group.membersCount })}</p>
          )}
        </div>
        <div className="relative h-80 w-full overflow-hidden rounded-3xl">
          <Image
            src={
              group.cover ||
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
            }
            alt={group.name}
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
          <ul className="list-disc space-y-2 pl-6 text-sm text-text-secondary">
            {group.achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
