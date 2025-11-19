import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import LyricsDisplay from "@/components/lyrics/LyricsDisplay";
import YouTubeEmbed from "@/components/music/YouTubeEmbed";
import type { AppLocale } from "@/i18n";
import { fetchSongIds } from "@/lib/notion/albums";
import { fetchSongById } from "@/lib/notion/songs";

interface SongPageParams {
  params: Promise<{ locale: AppLocale; id: string }>;
}

export default async function SongPage({ params }: SongPageParams) {
  const { locale, id } = await params;
  const [t, song] = await Promise.all([getTranslations({ locale }), fetchSongById(id)]);

  if (!song) {
    notFound();
  }

  const youtubeId = song.videoUrl?.includes("youtube")
    ? song.videoUrl.split("v=")[1]?.split("&")[0]
    : undefined;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 text-white">
      <Link className="text-sm text-accent-teal transition hover:text-white" href={`/${locale}/discography`}>
        ← {t("discography.back")}
      </Link>
      <div className="mt-4 space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-yellow">{song.album}</p>
        <h1 className="text-4xl font-bold">{song.title}</h1>
        {song.description && <p className="text-text-secondary">{song.description}</p>}
      </div>
      {youtubeId && (
        <div className="mt-8">
          <YouTubeEmbed videoId={youtubeId} title={song.title} />
        </div>
      )}
      <div className="mt-10">
        <LyricsDisplay lyrics={song.lyrics} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const ids = await fetchSongIds();
  return ids.map((id) => ({ id }));
}
