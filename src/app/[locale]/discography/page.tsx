import { getTranslations } from "next-intl/server";

import AlbumCard from "@/components/discography/AlbumCard";
import type { AppLocale } from "@/i18n";
import { fetchAlbums } from "@/lib/notion/albums";

export const revalidate = 86400; // 24 小時

interface DiscographyPageParams {
  params: Promise<{ locale: AppLocale }>;
}

export default async function DiscographyPage({ params }: DiscographyPageParams) {
  const { locale } = await params;
  const [t, albums] = await Promise.all([getTranslations({ locale }), fetchAlbums(locale)]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white">
      <header className="max-w-3xl space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-yellow">{t("discography.title")}</p>
        <h1 className="text-4xl font-bold md:text-5xl">{t("discography.hero.heading")}</h1>
        <p className="text-base text-text-secondary">{t("discography.hero.subheading")}</p>
      </header>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {albums.map((album, index) => (
          <AlbumCard
            key={album.id}
            album={album}
            locale={locale}
            priority={index < 2}
          />
        ))}
      </div>
    </div>
  );
}
